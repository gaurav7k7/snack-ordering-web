import ExcelJS from 'exceljs';
import { StatusCodes } from 'http-status-codes';

import { SubscriberModel } from '../models/Subscriber.model.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createApiResponse } from '../utils/apiResponse.js';
import { parseDateRangeFilter } from '../utils/dateRange.js';
import { escapeRegex } from '../utils/escapeRegex.js';
import { buildPaginationMeta, parsePagination } from '../utils/pagination.js';

function buildFilter(query: Record<string, unknown>) {
  const filter: Record<string, unknown> = { ...parseDateRangeFilter(query.range) };

  const search = typeof query.search === 'string' ? query.search.trim() : '';
  if (search) {
    filter.email = new RegExp(escapeRegex(search), 'i');
  }

  if (query.status === 'active') filter.isActive = true;
  if (query.status === 'unsubscribed') filter.isActive = false;

  return filter;
}

function buildSort(query: Record<string, unknown>) {
  const sortBy = query.sortBy === 'email' ? 'email' : 'createdAt';
  const sortDir = query.sortDir === 'asc' ? 1 : -1;
  return { [sortBy]: sortDir } as Record<string, 1 | -1>;
}

export const getSubscribers = asyncHandler(async (req, res) => {
  const pagination = parsePagination(req.query);
  const filter = buildFilter(req.query);
  const sort = buildSort(req.query);

  const [subscribers, total, totalSubscribers, activeSubscribers] = await Promise.all([
    SubscriberModel.find(filter)
      .sort(sort)
      .skip((pagination.page - 1) * pagination.limit)
      .limit(pagination.limit)
      .lean(),
    SubscriberModel.countDocuments(filter),
    SubscriberModel.countDocuments({}),
    SubscriberModel.countDocuments({ isActive: true }),
  ]);

  res.status(StatusCodes.OK).json(
    createApiResponse('Subscribers retrieved.', {
      subscribers,
      pagination: buildPaginationMeta(total, pagination),
      totalSubscribers,
      activeSubscribers,
    }),
  );
});

export const deleteSubscriber = asyncHandler(async (req, res) => {
  const subscriber = await SubscriberModel.findByIdAndDelete(req.params.id);
  if (!subscriber) {
    throw new AppError('Subscriber not found.', StatusCodes.NOT_FOUND);
  }
  res.status(StatusCodes.OK).json(createApiResponse('Subscriber deleted.'));
});

export const exportSubscribers = asyncHandler(async (req, res) => {
  const filter = buildFilter(req.query);
  const sort = buildSort(req.query);
  const format = req.query.format;

  const subscribers = await SubscriberModel.find(filter).sort(sort).lean();
  const dateStamp = new Date().toISOString().slice(0, 10);
  const rows = subscribers.map((subscriber) => ({
    email: subscriber.email,
    status: subscriber.isActive ? 'active' : 'unsubscribed',
    subscribedAt: subscriber.createdAt?.toISOString() ?? '',
    unsubscribedAt: subscriber.unsubscribedAt?.toISOString() ?? '',
  }));

  if (format === 'json') {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="snackco-subscribers-${dateStamp}.json"`);
    res.status(StatusCodes.OK).send(JSON.stringify(rows, null, 2));
    return;
  }

  if (format === 'xlsx') {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Subscribers');
    sheet.columns = [
      { header: 'Email', key: 'email', width: 32 },
      { header: 'Status', key: 'status', width: 14 },
      { header: 'Subscribed At', key: 'subscribedAt', width: 24 },
      { header: 'Unsubscribed At', key: 'unsubscribedAt', width: 24 },
    ];
    sheet.addRows(rows);
    sheet.getRow(1).font = { bold: true };

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="snackco-subscribers-${dateStamp}.xlsx"`);
    await workbook.xlsx.write(res);
    res.end();
    return;
  }

  const escapeCsvCell = (value: string) => (/[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value);
  const header = ['Email', 'Status', 'Subscribed At', 'Unsubscribed At'].join(',');
  const body = rows
    .map((row) => [row.email, row.status, row.subscribedAt, row.unsubscribedAt].map(escapeCsvCell).join(','))
    .join('\r\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="snackco-subscribers-${dateStamp}.csv"`);
  res.status(StatusCodes.OK).send(`${header}\r\n${body}`);
});
