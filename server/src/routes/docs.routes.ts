import { Router } from 'express';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';

import { openApiSpec } from '../docs/openapiSpec.js';

export const docsRoutes = Router();

docsRoutes.get('/api-docs.json', (_req, res) => {
  res.json(openApiSpec);
});

// Swagger UI's bundled assets use inline <style>/<script> tags, which the
// app's default (global) Helmet CSP would block — relax CSP for this route
// only rather than weakening it globally.
docsRoutes.use('/api-docs', helmet({ contentSecurityPolicy: false }));
docsRoutes.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiSpec, {
  customSiteTitle: 'SnackCo API Docs',
}));
