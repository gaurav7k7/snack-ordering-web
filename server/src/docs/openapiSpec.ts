import { env } from '../config/env.js';

/**
 * Hand-maintained OpenAPI 3.0 document for the entire REST API. Kept as a
 * single source of truth (rather than JSDoc scattered across ~20 route
 * files) so the whole surface can be reviewed/diffed in one place. Served
 * via swagger-ui-express at /api-docs (see app.ts).
 */

const paginationParams = [
  { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 }, description: 'Page number.' },
  { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100 }, description: 'Items per page.' },
];

const idParam = (name: string, description: string) => ({
  name,
  in: 'path' as const,
  required: true,
  schema: { type: 'string' as const },
  description,
});

function apiResponseOf(dataSchema: Record<string, unknown> | null) {
  return {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: { type: 'string' },
      data: dataSchema ?? { type: 'null', nullable: true },
    },
  };
}

const errorEnvelope = {
  type: 'object',
  properties: {
    success: { type: 'boolean', example: false },
    message: { type: 'string' },
    data: { type: 'null', nullable: true, example: null },
    stack: { type: 'string', nullable: true, description: 'Only present when NODE_ENV=development.' },
  },
};

const paginationMetaSchema = {
  type: 'object',
  properties: {
    page: { type: 'integer' },
    limit: { type: 'integer' },
    total: { type: 'integer' },
    totalPages: { type: 'integer' },
  },
};

const commonErrorResponses = {
  '400': {
    description: 'Validation error — request body/params/query failed schema validation.',
    content: { 'application/json': { schema: errorEnvelope } },
  },
  '401': {
    description: 'Missing or invalid authentication.',
    content: { 'application/json': { schema: errorEnvelope } },
  },
  '403': {
    description: "Authenticated but the caller's role is not permitted.",
    content: { 'application/json': { schema: errorEnvelope } },
  },
  '404': {
    description: 'Resource not found.',
    content: { 'application/json': { schema: errorEnvelope } },
  },
  '409': {
    description: 'Conflict — e.g. duplicate unique field.',
    content: { 'application/json': { schema: errorEnvelope } },
  },
  '500': {
    description: 'Unexpected server error.',
    content: { 'application/json': { schema: errorEnvelope } },
  },
};

function jsonBody(schema: Record<string, unknown>) {
  return { required: true, content: { 'application/json': { schema } } };
}

// ---------------------------------------------------------------------------
// Reusable entity schemas
// ---------------------------------------------------------------------------

const productImage = {
  type: 'object',
  properties: {
    url: { type: 'string', format: 'uri' },
    publicId: { type: 'string' },
    alt: { type: 'string' },
  },
};

const nutritionFacts = {
  type: 'object',
  properties: {
    servingSize: { type: 'string' },
    calories: { type: 'number' },
    protein: { type: 'string' },
    carbs: { type: 'string' },
    fat: { type: 'string' },
    sugar: { type: 'string' },
    sodium: { type: 'string' },
  },
};

const product = {
  type: 'object',
  properties: {
    _id: { type: 'string' },
    name: { type: 'string' },
    slug: { type: 'string' },
    description: { type: 'string' },
    ingredients: { type: 'array', items: { type: 'string' } },
    weight: { type: 'string' },
    nutritionFacts,
    mrp: { type: 'number' },
    discount: { type: 'number' },
    offerPrice: { type: 'number' },
    images: { type: 'array', items: productImage },
    category: { type: 'string', description: 'Category id (or populated object on detail endpoints).' },
    subCategory: { type: 'string' },
    stock: { type: 'integer' },
    availableQuantity: { type: 'integer' },
    sku: { type: 'string' },
    brand: { type: 'string' },
    tags: { type: 'array', items: { type: 'string' } },
    averageRating: { type: 'number' },
    reviewCount: { type: 'integer' },
    isActive: { type: 'boolean' },
    isFeatured: { type: 'boolean' },
    isTrending: { type: 'boolean' },
    isBestSeller: { type: 'boolean' },
    deliveryEstimate: { type: 'string' },
    returnPolicy: { type: 'string' },
    shippingInformation: { type: 'string' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
};

const productInput = {
  type: 'object',
  required: [
    'name', 'description', 'ingredients', 'weight', 'nutritionFacts', 'mrp', 'offerPrice',
    'images', 'category', 'subCategory', 'stock', 'availableQuantity', 'sku', 'brand',
    'deliveryEstimate', 'returnPolicy', 'shippingInformation',
  ],
  properties: {
    name: { type: 'string', minLength: 2, maxLength: 120 },
    slug: { type: 'string' },
    description: { type: 'string', minLength: 20, maxLength: 2000 },
    ingredients: { type: 'array', items: { type: 'string' }, minItems: 1 },
    weight: { type: 'string' },
    nutritionFacts,
    mrp: { type: 'number', minimum: 0 },
    discount: { type: 'number', minimum: 0, maximum: 100, default: 0 },
    offerPrice: { type: 'number', minimum: 0 },
    images: { type: 'array', items: productImage, minItems: 1, maxItems: 8 },
    category: { type: 'string', description: 'Category id, name, or slug — resolved server-side.' },
    subCategory: { type: 'string' },
    stock: { type: 'integer', minimum: 0 },
    availableQuantity: { type: 'integer', minimum: 0 },
    sku: { type: 'string' },
    brand: { type: 'string' },
    tags: { type: 'array', items: { type: 'string' } },
    isActive: { type: 'boolean', default: true },
    isFeatured: { type: 'boolean', default: false },
    isTrending: { type: 'boolean', default: false },
    isBestSeller: { type: 'boolean', default: false },
    recommendedProducts: { type: 'array', items: { type: 'string' } },
    relatedProducts: { type: 'array', items: { type: 'string' } },
    deliveryEstimate: { type: 'string' },
    returnPolicy: { type: 'string' },
    shippingInformation: { type: 'string' },
  },
};

const category = {
  type: 'object',
  properties: {
    _id: { type: 'string' },
    name: { type: 'string' },
    slug: { type: 'string' },
    description: { type: 'string' },
    image: { type: 'object', properties: { url: { type: 'string' }, publicId: { type: 'string' }, alt: { type: 'string' } } },
    isActive: { type: 'boolean' },
  },
};

const subCategory = {
  type: 'object',
  properties: {
    _id: { type: 'string' },
    name: { type: 'string' },
    slug: { type: 'string' },
    category: { type: 'string' },
    description: { type: 'string' },
    isActive: { type: 'boolean' },
  },
};

const brand = {
  type: 'object',
  properties: {
    _id: { type: 'string' },
    name: { type: 'string' },
    slug: { type: 'string' },
    description: { type: 'string' },
    logo: { type: 'object', properties: { url: { type: 'string' }, publicId: { type: 'string' } } },
    isActive: { type: 'boolean' },
  },
};

const tag = {
  type: 'object',
  properties: {
    _id: { type: 'string' },
    name: { type: 'string' },
    slug: { type: 'string' },
    isActive: { type: 'boolean' },
  },
};

const address = {
  type: 'object',
  properties: {
    fullName: { type: 'string' },
    phone: { type: 'string' },
    line1: { type: 'string' },
    line2: { type: 'string' },
    city: { type: 'string' },
    state: { type: 'string' },
    postalCode: { type: 'string' },
    country: { type: 'string', default: 'India' },
  },
};

const orderItem = {
  type: 'object',
  properties: {
    product: { type: 'string' },
    name: { type: 'string' },
    image: { type: 'string' },
    price: { type: 'number' },
    quantity: { type: 'integer' },
  },
};

const order = {
  type: 'object',
  properties: {
    _id: { type: 'string' },
    orderNumber: { type: 'string' },
    user: { type: 'string', nullable: true },
    items: { type: 'array', items: orderItem },
    shippingAddress: address,
    subtotal: { type: 'number' },
    shippingFee: { type: 'number' },
    tax: { type: 'number' },
    total: { type: 'number' },
    couponCode: { type: 'string' },
    couponDiscount: { type: 'number' },
    status: {
      type: 'string',
      enum: [
        'pending', 'confirmed', 'packed', 'shipped', 'out_for_delivery',
        'delivered', 'cancelled', 'return_requested', 'returned', 'refunded',
      ],
    },
    isGuest: { type: 'boolean' },
    guestEmail: { type: 'string' },
    payment: {
      type: 'object',
      properties: {
        provider: { type: 'string' },
        status: { type: 'string' },
        razorpayOrderId: { type: 'string' },
        razorpayPaymentId: { type: 'string' },
      },
    },
    createdAt: { type: 'string', format: 'date-time' },
  },
};

const coupon = {
  type: 'object',
  properties: {
    _id: { type: 'string' },
    code: { type: 'string' },
    description: { type: 'string' },
    discountType: { type: 'string', enum: ['percentage', 'flat'] },
    discountValue: { type: 'number' },
    maxDiscountAmount: { type: 'number', nullable: true },
    minOrderValue: { type: 'number' },
    validFrom: { type: 'string', format: 'date-time' },
    validUntil: { type: 'string', format: 'date-time' },
    usageLimit: { type: 'integer', nullable: true },
    usageCount: { type: 'integer' },
    perUserLimit: { type: 'integer' },
    isAutomatic: { type: 'boolean' },
    isActive: { type: 'boolean' },
  },
};

const review = {
  type: 'object',
  properties: {
    _id: { type: 'string' },
    name: { type: 'string' },
    rating: { type: 'integer', minimum: 1, maximum: 5 },
    title: { type: 'string' },
    comment: { type: 'string' },
    images: { type: 'array', items: { type: 'object', properties: { url: { type: 'string' }, publicId: { type: 'string' } } } },
    isVerifiedPurchase: { type: 'boolean' },
    status: { type: 'string', enum: ['approved', 'rejected'] },
    helpfulCount: { type: 'integer' },
    hasVoted: { type: 'boolean' },
    isOwner: { type: 'boolean' },
    createdAt: { type: 'string', format: 'date-time' },
  },
};

const user = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    email: { type: 'string', format: 'email' },
    phone: { type: 'string' },
    role: { type: 'string', enum: ['customer', 'admin'] },
    avatar: { type: 'string' },
    isEmailVerified: { type: 'boolean' },
    isActive: { type: 'boolean' },
    addresses: { type: 'array', items: { type: 'string' } },
    wallet: { type: 'object', properties: { balance: { type: 'number' }, currency: { type: 'string' } } },
  },
};

const contactMessage = {
  type: 'object',
  properties: {
    _id: { type: 'string' },
    name: { type: 'string' },
    email: { type: 'string' },
    subject: { type: 'string' },
    message: { type: 'string' },
    status: { type: 'string', enum: ['new', 'read', 'resolved'] },
    createdAt: { type: 'string', format: 'date-time' },
  },
};

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'SnackCo API',
    version: '1.0.0',
    description:
      'REST API for the SnackCo online snack ordering platform. All responses share the envelope ' +
      '`{ success, message, data }`; validation and unexpected errors are returned by a central ' +
      'error handler as `{ success: false, message, data: null }` with an appropriate HTTP status code. ' +
      'Authentication uses an httpOnly `accessToken` cookie (or an `Authorization: Bearer` header). ' +
      'Every mutating request (POST/PATCH/PUT/DELETE) must also send an `x-csrf-token` header whose ' +
      'value matches the non-httpOnly `csrfToken` cookie issued on any GET request (double-submit-cookie CSRF protection).',
  },
  servers: [{ url: `${env.siteUrl.includes('5173') ? 'http://localhost:5000' : env.siteUrl}/api/v1`, description: 'API base' }],
  tags: [
    { name: 'Health', description: 'Service liveness/maintenance status.' },
    { name: 'Auth', description: 'Registration, login, OTP, password reset, Google OAuth, sessions.' },
    { name: 'Products', description: 'Public product catalog, search, and admin product management.' },
    { name: 'Reviews', description: 'Product reviews, helpful votes, reporting, and moderation.' },
    { name: 'Categories', description: 'Category taxonomy CRUD.' },
    { name: 'SubCategories', description: 'Sub-category taxonomy CRUD.' },
    { name: 'Brands', description: 'Brand taxonomy CRUD.' },
    { name: 'Tags', description: 'Tag taxonomy CRUD.' },
    { name: 'Orders', description: 'Cart checkout, payment, order lifecycle, admin fulfillment.' },
    { name: 'Coupons', description: 'Coupon validation and admin coupon management.' },
    { name: 'Profile', description: "The authenticated customer's own account, wishlist, wallet, orders." },
    { name: 'Admin Customers', description: 'Admin customer management.' },
    { name: 'Dashboard', description: 'Admin analytics dashboard.' },
    { name: 'Uploads', description: 'Cloudinary signed upload parameters.' },
    { name: 'Newsletter', description: 'Email newsletter subscribe/unsubscribe.' },
    { name: 'Contact', description: 'Public contact form and admin inbox.' },
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'accessToken',
        description: 'httpOnly JWT access token cookie set on login/register/refresh. A Bearer Authorization header is also accepted.',
      },
    },
    responses: commonErrorResponses,
    schemas: {
      ApiResponse: apiResponseOf(null),
      Error: errorEnvelope,
      PaginationMeta: paginationMetaSchema,
      Product: product,
      ProductInput: productInput,
      Category: category,
      SubCategory: subCategory,
      Brand: brand,
      Tag: tag,
      Order: order,
      Coupon: coupon,
      Review: review,
      User: user,
      Address: address,
      ContactMessage: contactMessage,
    },
  },
  security: [{ cookieAuth: [] }],
  paths: {
    // ---------------------------------------------------------------- Health
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Service health check',
        security: [],
        responses: {
          '200': {
            description: 'Service is up.',
            content: {
              'application/json': {
                schema: apiResponseOf({
                  type: 'object',
                  properties: {
                    service: { type: 'string' },
                    uptime: { type: 'number' },
                    timestamp: { type: 'string', format: 'date-time' },
                    maintenance: { type: 'boolean' },
                  },
                }),
              },
            },
          },
        },
      },
    },

    // ------------------------------------------------------------------ Auth
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new customer account',
        security: [],
        requestBody: jsonBody({
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: { type: 'string', minLength: 2, maxLength: 80 },
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 8, maxLength: 128 },
            rememberMe: { type: 'boolean' },
          },
        }),
        responses: {
          '201': { description: 'Account created; verification email sent.', content: { 'application/json': { schema: apiResponseOf({ type: 'object', properties: { user } }) } } },
          '400': commonErrorResponses['400'],
          '409': commonErrorResponses['409'],
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Log in with email and password',
        security: [],
        requestBody: jsonBody({
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string' },
            rememberMe: { type: 'boolean' },
          },
        }),
        responses: {
          '200': { description: 'Logged in; sets accessToken/refreshToken/csrfToken cookies.', content: { 'application/json': { schema: apiResponseOf({ type: 'object', properties: { user } }) } } },
          '400': commonErrorResponses['400'],
          '401': commonErrorResponses['401'],
        },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Log out and clear session cookies',
        responses: { '200': { description: 'Logged out.', content: { 'application/json': { schema: apiResponseOf(null) } } } },
      },
    },
    '/auth/refresh': {
      post: {
        tags: ['Auth'],
        summary: 'Rotate the refresh token and issue a new access token',
        security: [],
        responses: { '200': { description: 'New access token issued.', content: { 'application/json': { schema: apiResponseOf(null) } } }, '401': commonErrorResponses['401'] },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get the currently authenticated user',
        responses: { '200': { description: 'Current user.', content: { 'application/json': { schema: apiResponseOf({ type: 'object', properties: { user } }) } } }, '401': commonErrorResponses['401'] },
      },
    },
    '/auth/verify-email': {
      post: {
        tags: ['Auth'],
        summary: 'Verify an email address with a token',
        security: [],
        requestBody: jsonBody({ type: 'object', required: ['email', 'token'], properties: { email: { type: 'string' }, token: { type: 'string' } } }),
        responses: { '200': { description: 'Email verified.', content: { 'application/json': { schema: apiResponseOf(null) } } }, '400': commonErrorResponses['400'] },
      },
    },
    '/auth/resend-verification': {
      post: {
        tags: ['Auth'],
        summary: 'Resend the email verification link',
        security: [],
        requestBody: jsonBody({ type: 'object', required: ['email'], properties: { email: { type: 'string' } } }),
        responses: { '200': { description: 'Verification email sent (if the account exists).', content: { 'application/json': { schema: apiResponseOf(null) } } } },
      },
    },
    '/auth/forgot-password': {
      post: {
        tags: ['Auth'],
        summary: 'Request a password reset email',
        security: [],
        requestBody: jsonBody({ type: 'object', required: ['email'], properties: { email: { type: 'string' } } }),
        responses: { '200': { description: 'Reset email sent (if the account exists).', content: { 'application/json': { schema: apiResponseOf(null) } } } },
      },
    },
    '/auth/reset-password': {
      post: {
        tags: ['Auth'],
        summary: 'Reset password using an emailed token',
        security: [],
        requestBody: jsonBody({
          type: 'object',
          required: ['email', 'token', 'password'],
          properties: { email: { type: 'string' }, token: { type: 'string' }, password: { type: 'string' }, rememberMe: { type: 'boolean' } },
        }),
        responses: { '200': { description: 'Password reset.', content: { 'application/json': { schema: apiResponseOf(null) } } }, '400': commonErrorResponses['400'] },
      },
    },
    '/auth/otp/request': {
      post: {
        tags: ['Auth'],
        summary: 'Request a one-time login/verification code by email',
        security: [],
        requestBody: jsonBody({ type: 'object', required: ['email'], properties: { email: { type: 'string' } } }),
        responses: { '200': { description: 'OTP sent.', content: { 'application/json': { schema: apiResponseOf(null) } } } },
      },
    },
    '/auth/otp/verify': {
      post: {
        tags: ['Auth'],
        summary: 'Verify an OTP and log in',
        security: [],
        requestBody: jsonBody({
          type: 'object',
          required: ['email', 'otp'],
          properties: { email: { type: 'string' }, otp: { type: 'string', minLength: 6, maxLength: 6 }, rememberMe: { type: 'boolean' } },
        }),
        responses: { '200': { description: 'Logged in via OTP.', content: { 'application/json': { schema: apiResponseOf({ type: 'object', properties: { user } }) } } }, '400': commonErrorResponses['400'] },
      },
    },
    '/auth/google': {
      get: { tags: ['Auth'], summary: 'Start Google OAuth sign-in (redirect)', security: [], responses: { '302': { description: 'Redirects to Google.' } } },
    },
    '/auth/google/callback': {
      get: { tags: ['Auth'], summary: 'Google OAuth callback (redirect)', security: [], responses: { '302': { description: 'Redirects back to the client with a session established.' } } },
    },

    // -------------------------------------------------------------- Products
    '/products': {
      get: {
        tags: ['Products'],
        summary: 'Search/list products with filtering, sorting, and pagination',
        security: [],
        parameters: [
          { name: 'q', in: 'query', schema: { type: 'string' }, description: 'Full-text search term.' },
          { name: 'category', in: 'query', schema: { type: 'string' }, description: 'Comma-separated category ids.' },
          { name: 'brand', in: 'query', schema: { type: 'string' }, description: 'Comma-separated brand names.' },
          { name: 'minPrice', in: 'query', schema: { type: 'number' } },
          { name: 'maxPrice', in: 'query', schema: { type: 'number' } },
          { name: 'rating', in: 'query', schema: { type: 'number', minimum: 1, maximum: 5 }, description: 'Minimum average rating.' },
          { name: 'availability', in: 'query', schema: { type: 'string', enum: ['available', 'low_stock', 'out_of_stock'] } },
          { name: 'discount', in: 'query', schema: { type: 'number' }, description: 'Minimum discount percentage.' },
          { name: 'ids', in: 'query', schema: { type: 'string' }, description: 'Comma-separated product ids — fetch a specific set (e.g. compare, recently viewed).' },
          { name: 'featured', in: 'query', schema: { type: 'string', enum: ['true'] }, description: 'Only isFeatured products.' },
          { name: 'trending', in: 'query', schema: { type: 'string', enum: ['true'] }, description: 'Only isTrending products.' },
          { name: 'bestSeller', in: 'query', schema: { type: 'string', enum: ['true'] }, description: 'Only isBestSeller products.' },
          {
            name: 'sort',
            in: 'query',
            schema: { type: 'string', enum: ['newest', 'popularity', 'price_low_to_high', 'price_high_to_low', 'highest_rated', 'best_selling'] },
          },
          ...paginationParams,
        ],
        responses: {
          '200': {
            description: 'Paginated product list.',
            content: {
              'application/json': {
                schema: apiResponseOf({ type: 'object', properties: { products: { type: 'array', items: product }, pagination: paginationMetaSchema } }),
              },
            },
          },
        },
      },
      post: {
        tags: ['Products'],
        summary: '[Admin] Create a product',
        requestBody: jsonBody(productInput),
        responses: {
          '201': { description: 'Product created.', content: { 'application/json': { schema: apiResponseOf({ type: 'object', properties: { product } }) } } },
          '400': commonErrorResponses['400'],
          '409': commonErrorResponses['409'],
        },
      },
    },
    '/products/suggestions': {
      get: {
        tags: ['Products'],
        summary: 'Type-ahead search suggestions',
        security: [],
        parameters: [{ name: 'q', in: 'query', schema: { type: 'string' } }],
        responses: { '200': { description: 'Suggestions.', content: { 'application/json': { schema: apiResponseOf({ type: 'object', properties: { products: { type: 'array', items: { type: 'object' } }, categories: { type: 'array', items: { type: 'object' } } } }) } } } },
      },
    },
    '/products/{slug}': {
      get: {
        tags: ['Products'],
        summary: 'Get a single product by slug',
        security: [],
        parameters: [idParam('slug', 'Product slug.')],
        responses: { '200': { description: 'Product detail.', content: { 'application/json': { schema: apiResponseOf({ type: 'object', properties: { product } }) } } }, '404': commonErrorResponses['404'] },
      },
    },
    '/products/admin': {
      get: {
        tags: ['Products'],
        summary: '[Admin] List products for the admin catalog table',
        parameters: [
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'category', in: 'query', schema: { type: 'string' } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['active', 'inactive'] } },
          { name: 'stockFilter', in: 'query', schema: { type: 'string', enum: ['low', 'out'] } },
          ...paginationParams,
        ],
        responses: { '200': { description: 'Paginated product list.', content: { 'application/json': { schema: apiResponseOf({ type: 'object', properties: { products: { type: 'array', items: product }, pagination: paginationMetaSchema } }) } } }, '401': commonErrorResponses['401'], '403': commonErrorResponses['403'] },
      },
    },
    '/products/admin/{id}': {
      get: {
        tags: ['Products'],
        summary: '[Admin] Get a product by id',
        parameters: [idParam('id', 'Product id.')],
        responses: { '200': { description: 'Product.', content: { 'application/json': { schema: apiResponseOf({ type: 'object', properties: { product } }) } } }, '404': commonErrorResponses['404'] },
      },
    },
    '/products/admin/export': {
      get: {
        tags: ['Products'],
        summary: '[Admin] Export the full product catalog (unpaginated)',
        responses: { '200': { description: 'All products.', content: { 'application/json': { schema: apiResponseOf({ type: 'object', properties: { products: { type: 'array', items: product } } }) } } } },
      },
    },
    '/products/admin/bulk-import': {
      post: {
        tags: ['Products'],
        summary: '[Admin] Bulk-import products; each row is validated independently and failures are reported per-row',
        requestBody: jsonBody({ type: 'object', required: ['products'], properties: { products: { type: 'array', items: productInput, maxItems: 500 } } }),
        responses: { '200': { description: 'Import summary.', content: { 'application/json': { schema: apiResponseOf({ type: 'object', properties: { created: { type: 'integer' }, failed: { type: 'array', items: { type: 'object', properties: { row: { type: 'integer' }, sku: { type: 'string' }, error: { type: 'string' } } } } } }) } } } },
      },
    },
    '/products/{id}': {
      patch: {
        tags: ['Products'],
        summary: '[Admin] Update a product (partial)',
        parameters: [idParam('id', 'Product id.')],
        requestBody: jsonBody({ ...productInput, required: [] }),
        responses: { '200': { description: 'Product updated.', content: { 'application/json': { schema: apiResponseOf({ type: 'object', properties: { product } }) } } }, '404': commonErrorResponses['404'] },
      },
      delete: {
        tags: ['Products'],
        summary: '[Admin] Delete a product',
        parameters: [idParam('id', 'Product id.')],
        responses: { '200': { description: 'Product deleted.', content: { 'application/json': { schema: apiResponseOf(null) } } }, '404': commonErrorResponses['404'] },
      },
    },

    // --------------------------------------------------------------- Reviews
    '/products/{productId}/reviews': {
      get: {
        tags: ['Reviews'],
        summary: 'List a product’s reviews (paginated, sortable, filterable by rating)',
        security: [],
        parameters: [
          idParam('productId', 'Product id.'),
          { name: 'sort', in: 'query', schema: { type: 'string', enum: ['recent', 'helpful'] } },
          { name: 'rating', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 5 } },
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1 } },
        ],
        responses: {
          '200': {
            description: 'Reviews with rating distribution.',
            content: {
              'application/json': {
                schema: apiResponseOf({
                  type: 'object',
                  properties: {
                    reviews: { type: 'array', items: review },
                    pagination: paginationMetaSchema,
                    ratingDistribution: { type: 'object' },
                    averageRating: { type: 'number' },
                    reviewCount: { type: 'integer' },
                    currentUserReview: { ...review, nullable: true },
                  },
                }),
              },
            },
          },
        },
      },
      post: {
        tags: ['Reviews'],
        summary: 'Create a review for a product (one per user, requires purchase for the verified badge)',
        parameters: [idParam('productId', 'Product id.')],
        requestBody: jsonBody({
          type: 'object',
          required: ['rating', 'title', 'comment'],
          properties: {
            rating: { type: 'integer', minimum: 1, maximum: 5 },
            title: { type: 'string', maxLength: 120 },
            comment: { type: 'string', maxLength: 2000 },
            images: { type: 'array', maxItems: 4, items: { type: 'object', properties: { url: { type: 'string' }, publicId: { type: 'string' } } } },
          },
        }),
        responses: { '201': { description: 'Review created.', content: { 'application/json': { schema: apiResponseOf({ type: 'object', properties: { review } }) } } }, '400': commonErrorResponses['400'], '409': commonErrorResponses['409'] },
      },
    },
    '/products/{productId}/reviews/{reviewId}': {
      patch: {
        tags: ['Reviews'],
        summary: 'Update your own review',
        parameters: [idParam('productId', 'Product id.'), idParam('reviewId', 'Review id.')],
        requestBody: jsonBody({ type: 'object', properties: { rating: { type: 'integer' }, title: { type: 'string' }, comment: { type: 'string' } } }),
        responses: { '200': { description: 'Review updated.', content: { 'application/json': { schema: apiResponseOf({ type: 'object', properties: { review } }) } } }, '403': commonErrorResponses['403'] },
      },
      delete: {
        tags: ['Reviews'],
        summary: 'Delete your own review (or any review, as admin)',
        parameters: [idParam('productId', 'Product id.'), idParam('reviewId', 'Review id.')],
        responses: { '200': { description: 'Review deleted.', content: { 'application/json': { schema: apiResponseOf(null) } } }, '403': commonErrorResponses['403'] },
      },
    },
    '/products/{productId}/reviews/{reviewId}/helpful': {
      post: {
        tags: ['Reviews'],
        summary: 'Toggle a helpful vote on a review',
        parameters: [idParam('productId', 'Product id.'), idParam('reviewId', 'Review id.')],
        responses: { '200': { description: 'Vote toggled.', content: { 'application/json': { schema: apiResponseOf({ type: 'object', properties: { helpfulCount: { type: 'integer' }, hasVoted: { type: 'boolean' } } }) } } } },
      },
    },
    '/products/{productId}/reviews/{reviewId}/report': {
      post: {
        tags: ['Reviews'],
        summary: 'Report a review for moderation',
        parameters: [idParam('productId', 'Product id.'), idParam('reviewId', 'Review id.')],
        requestBody: jsonBody({ type: 'object', required: ['reason'], properties: { reason: { type: 'string', minLength: 3, maxLength: 300 } } }),
        responses: { '200': { description: 'Report recorded.', content: { 'application/json': { schema: apiResponseOf(null) } } }, '409': commonErrorResponses['409'] },
      },
    },
    '/products/{productId}/reviews/{reviewId}/moderate': {
      patch: {
        tags: ['Reviews'],
        summary: '[Admin] Approve or reject a review',
        parameters: [idParam('productId', 'Product id.'), idParam('reviewId', 'Review id.')],
        requestBody: jsonBody({ type: 'object', required: ['status'], properties: { status: { type: 'string', enum: ['approved', 'rejected'] } } }),
        responses: { '200': { description: 'Review moderated.', content: { 'application/json': { schema: apiResponseOf({ type: 'object', properties: { review } }) } } } },
      },
    },
    '/admin/reviews': {
      get: {
        tags: ['Reviews'],
        summary: '[Admin] List all reviews across products (filterable by status/reported/rating/search)',
        parameters: [
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['approved', 'rejected'] } },
          { name: 'reported', in: 'query', schema: { type: 'boolean' } },
          { name: 'rating', in: 'query', schema: { type: 'integer' } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          ...paginationParams,
        ],
        responses: { '200': { description: 'Paginated reviews.', content: { 'application/json': { schema: apiResponseOf({ type: 'object', properties: { reviews: { type: 'array', items: review }, pagination: paginationMetaSchema } }) } } } },
      },
    },
    '/admin/reviews/{productId}/{reviewId}/dismiss-reports': {
      patch: {
        tags: ['Reviews'],
        summary: '[Admin] Dismiss all reports on a review without rejecting it',
        parameters: [idParam('productId', 'Product id.'), idParam('reviewId', 'Review id.')],
        responses: { '200': { description: 'Reports dismissed.', content: { 'application/json': { schema: apiResponseOf(null) } } } },
      },
    },

    // ------------------------------------------------------------ Taxonomy
    '/categories': {
      get: { tags: ['Categories'], summary: 'List categories', security: [], parameters: [{ name: 'includeInactive', in: 'query', schema: { type: 'boolean' } }], responses: { '200': { description: 'Categories.', content: { 'application/json': { schema: apiResponseOf({ type: 'object', properties: { categories: { type: 'array', items: category } } }) } } } } },
      post: { tags: ['Categories'], summary: '[Admin] Create a category', requestBody: jsonBody({ type: 'object', required: ['name'], properties: { name: { type: 'string' }, description: { type: 'string' }, image: { type: 'object' } } }), responses: { '201': { description: 'Created.', content: { 'application/json': { schema: apiResponseOf({ type: 'object', properties: { category } }) } } }, '409': commonErrorResponses['409'] } },
    },
    '/categories/{id}': {
      patch: { tags: ['Categories'], summary: '[Admin] Update a category', parameters: [idParam('id', 'Category id.')], requestBody: jsonBody({ type: 'object', properties: { name: { type: 'string' }, description: { type: 'string' }, isActive: { type: 'boolean' } } }), responses: { '200': { description: 'Updated.', content: { 'application/json': { schema: apiResponseOf({ type: 'object', properties: { category } }) } } }, '404': commonErrorResponses['404'] } },
      delete: { tags: ['Categories'], summary: '[Admin] Delete a category (must have no products)', parameters: [idParam('id', 'Category id.')], responses: { '200': { description: 'Deleted.', content: { 'application/json': { schema: apiResponseOf(null) } } }, '400': commonErrorResponses['400'] } },
    },
    '/subcategories': {
      get: { tags: ['SubCategories'], summary: 'List sub-categories', security: [], parameters: [{ name: 'category', in: 'query', schema: { type: 'string' } }, { name: 'includeInactive', in: 'query', schema: { type: 'boolean' } }], responses: { '200': { description: 'Sub-categories.', content: { 'application/json': { schema: apiResponseOf({ type: 'object', properties: { subCategories: { type: 'array', items: subCategory } } }) } } } } },
      post: { tags: ['SubCategories'], summary: '[Admin] Create a sub-category', requestBody: jsonBody({ type: 'object', required: ['name', 'category'], properties: { name: { type: 'string' }, category: { type: 'string' }, description: { type: 'string' } } }), responses: { '201': { description: 'Created.', content: { 'application/json': { schema: apiResponseOf({ type: 'object', properties: { subCategory } }) } } } } },
    },
    '/subcategories/{id}': {
      patch: { tags: ['SubCategories'], summary: '[Admin] Update a sub-category', parameters: [idParam('id', 'Sub-category id.')], requestBody: jsonBody({ type: 'object', properties: { name: { type: 'string' }, isActive: { type: 'boolean' } } }), responses: { '200': { description: 'Updated.', content: { 'application/json': { schema: apiResponseOf({ type: 'object', properties: { subCategory } }) } } } } },
      delete: { tags: ['SubCategories'], summary: '[Admin] Delete a sub-category (must have no products)', parameters: [idParam('id', 'Sub-category id.')], responses: { '200': { description: 'Deleted.', content: { 'application/json': { schema: apiResponseOf(null) } } } } },
    },
    '/brands': {
      get: { tags: ['Brands'], summary: 'List brands', security: [], parameters: [{ name: 'includeInactive', in: 'query', schema: { type: 'boolean' } }], responses: { '200': { description: 'Brands.', content: { 'application/json': { schema: apiResponseOf({ type: 'object', properties: { brands: { type: 'array', items: brand } } }) } } } } },
      post: { tags: ['Brands'], summary: '[Admin] Create a brand', requestBody: jsonBody({ type: 'object', required: ['name'], properties: { name: { type: 'string' }, description: { type: 'string' } } }), responses: { '201': { description: 'Created.', content: { 'application/json': { schema: apiResponseOf({ type: 'object', properties: { brand } }) } } } } },
    },
    '/brands/{id}': {
      patch: { tags: ['Brands'], summary: '[Admin] Update a brand', parameters: [idParam('id', 'Brand id.')], requestBody: jsonBody({ type: 'object', properties: { name: { type: 'string' }, isActive: { type: 'boolean' } } }), responses: { '200': { description: 'Updated.', content: { 'application/json': { schema: apiResponseOf({ type: 'object', properties: { brand } }) } } } } },
      delete: { tags: ['Brands'], summary: '[Admin] Delete a brand (must have no products)', parameters: [idParam('id', 'Brand id.')], responses: { '200': { description: 'Deleted.', content: { 'application/json': { schema: apiResponseOf(null) } } } } },
    },
    '/tags': {
      get: { tags: ['Tags'], summary: 'List tags', security: [], parameters: [{ name: 'includeInactive', in: 'query', schema: { type: 'boolean' } }], responses: { '200': { description: 'Tags.', content: { 'application/json': { schema: apiResponseOf({ type: 'object', properties: { tags: { type: 'array', items: tag } } }) } } } } },
      post: { tags: ['Tags'], summary: '[Admin] Create a tag', requestBody: jsonBody({ type: 'object', required: ['name'], properties: { name: { type: 'string' } } }), responses: { '201': { description: 'Created.', content: { 'application/json': { schema: apiResponseOf({ type: 'object', properties: { tag } }) } } } } },
    },
    '/tags/{id}': {
      patch: { tags: ['Tags'], summary: '[Admin] Update a tag', parameters: [idParam('id', 'Tag id.')], requestBody: jsonBody({ type: 'object', properties: { name: { type: 'string' }, isActive: { type: 'boolean' } } }), responses: { '200': { description: 'Updated.', content: { 'application/json': { schema: apiResponseOf({ type: 'object', properties: { tag } }) } } } } },
      delete: { tags: ['Tags'], summary: '[Admin] Delete a tag (removed from any products using it)', parameters: [idParam('id', 'Tag id.')], responses: { '200': { description: 'Deleted.', content: { 'application/json': { schema: apiResponseOf(null) } } } } },
    },

    // ---------------------------------------------------------------- Orders
    '/orders': {
      post: {
        tags: ['Orders'],
        summary: 'Place an order (guest checkout allowed)',
        security: [],
        requestBody: jsonBody({
          type: 'object',
          required: ['items', 'shippingAddress'],
          properties: {
            items: { type: 'array', items: { type: 'object', properties: { productId: { type: 'string' }, name: { type: 'string' }, price: { type: 'number' }, quantity: { type: 'integer' } } } },
            shippingAddress: address,
            deliveryInstructions: { type: 'string' },
            paymentMethod: { type: 'string', enum: ['cod', 'razorpay'], default: 'cod' },
            couponCode: { type: 'string' },
            guestName: { type: 'string' },
            guestEmail: { type: 'string' },
            guestPhone: { type: 'string' },
          },
        }),
        responses: {
          '201': { description: 'Order placed (or prepared for Razorpay payment).', content: { 'application/json': { schema: apiResponseOf({ type: 'object', properties: { order } }) } } },
          '400': commonErrorResponses['400'],
        },
      },
      get: {
        tags: ['Orders'],
        summary: "List the authenticated customer's own orders",
        parameters: [{ name: 'status', in: 'query', schema: { type: 'string' } }, ...paginationParams],
        responses: { '200': { description: 'Paginated orders.', content: { 'application/json': { schema: apiResponseOf({ type: 'object', properties: { orders: { type: 'array', items: order }, pagination: paginationMetaSchema } }) } } } },
      },
    },
    '/orders/verify-payment': {
      post: {
        tags: ['Orders'],
        summary: 'Verify a Razorpay payment signature and confirm the order',
        security: [],
        requestBody: jsonBody({ type: 'object', required: ['orderId', 'razorpayOrderId', 'razorpayPaymentId', 'razorpaySignature'], properties: { orderId: { type: 'string' }, razorpayOrderId: { type: 'string' }, razorpayPaymentId: { type: 'string' }, razorpaySignature: { type: 'string' } } }),
        responses: { '200': { description: 'Payment verified.', content: { 'application/json': { schema: apiResponseOf({ type: 'object', properties: { order } }) } } }, '400': commonErrorResponses['400'] },
      },
    },
    '/orders/{id}': {
      get: { tags: ['Orders'], summary: "Get one of the authenticated customer's own orders", parameters: [idParam('id', 'Order id.')], responses: { '200': { description: 'Order.', content: { 'application/json': { schema: apiResponseOf({ type: 'object', properties: { order } }) } } }, '403': commonErrorResponses['403'], '404': commonErrorResponses['404'] } },
    },
    '/orders/{id}/invoice': {
      get: { tags: ['Orders'], summary: 'Download/view the PDF invoice for an order', parameters: [idParam('id', 'Order id.'), { name: 'download', in: 'query', schema: { type: 'boolean' } }], responses: { '200': { description: 'PDF stream.', content: { 'application/pdf': { schema: { type: 'string', format: 'binary' } } } } } },
    },
    '/orders/{id}/cancel': {
      post: { tags: ['Orders'], summary: 'Cancel your own order (only while cancellable)', parameters: [idParam('id', 'Order id.')], requestBody: jsonBody({ type: 'object', properties: { reason: { type: 'string', maxLength: 500 } } }), responses: { '200': { description: 'Order cancelled.', content: { 'application/json': { schema: apiResponseOf({ type: 'object', properties: { order } }) } } }, '400': commonErrorResponses['400'] } },
    },
    '/orders/{id}/return': {
      post: { tags: ['Orders'], summary: 'Request a return for a delivered order (within the return window)', parameters: [idParam('id', 'Order id.')], requestBody: jsonBody({ type: 'object', required: ['reason'], properties: { reason: { type: 'string', minLength: 3, maxLength: 500 } } }), responses: { '200': { description: 'Return requested.', content: { 'application/json': { schema: apiResponseOf({ type: 'object', properties: { order } }) } } }, '400': commonErrorResponses['400'] } },
    },
    '/orders/{id}/status': {
      patch: { tags: ['Orders'], summary: '[Admin] Update order status', parameters: [idParam('id', 'Order id.')], requestBody: jsonBody({ type: 'object', required: ['status'], properties: { status: { type: 'string' }, note: { type: 'string' } } }), responses: { '200': { description: 'Status updated.', content: { 'application/json': { schema: apiResponseOf({ type: 'object', properties: { order } }) } } } } },
    },
    '/orders/admin': {
      get: { tags: ['Orders'], summary: '[Admin] List all orders (filterable by status/search/userId)', parameters: [{ name: 'status', in: 'query', schema: { type: 'string' } }, { name: 'search', in: 'query', schema: { type: 'string' } }, { name: 'userId', in: 'query', schema: { type: 'string' } }, ...paginationParams], responses: { '200': { description: 'Paginated orders.', content: { 'application/json': { schema: apiResponseOf({ type: 'object', properties: { orders: { type: 'array', items: order }, pagination: paginationMetaSchema } }) } } } } },
    },
    '/orders/admin/{id}': {
      get: { tags: ['Orders'], summary: '[Admin] Get any order by id', parameters: [idParam('id', 'Order id.')], responses: { '200': { description: 'Order.', content: { 'application/json': { schema: apiResponseOf({ type: 'object', properties: { order } }) } } } } },
    },
    '/orders/admin/{id}/invoice': {
      get: { tags: ['Orders'], summary: '[Admin] Download/view the PDF invoice for any order', parameters: [idParam('id', 'Order id.')], responses: { '200': { description: 'PDF stream.', content: { 'application/pdf': { schema: { type: 'string', format: 'binary' } } } } } },
    },
    '/orders/admin/{id}/cancel': {
      post: { tags: ['Orders'], summary: '[Admin] Cancel any order', parameters: [idParam('id', 'Order id.')], requestBody: jsonBody({ type: 'object', properties: { reason: { type: 'string' } } }), responses: { '200': { description: 'Order cancelled.', content: { 'application/json': { schema: apiResponseOf({ type: 'object', properties: { order } }) } } } } },
    },
    '/orders/admin/{id}/refund': {
      post: { tags: ['Orders'], summary: '[Admin] Manually refund a paid order via Razorpay', parameters: [idParam('id', 'Order id.')], requestBody: jsonBody({ type: 'object', properties: { amount: { type: 'number' }, reason: { type: 'string' } } }), responses: { '200': { description: 'Refund processed.', content: { 'application/json': { schema: apiResponseOf({ type: 'object', properties: { order } }) } } }, '502': { description: 'Refund gateway call failed.', content: { 'application/json': { schema: errorEnvelope } } } } },
    },
    '/orders/admin/{id}/assign-delivery': {
      patch: { tags: ['Orders'], summary: '[Admin] Assign (or clear) a delivery partner on an order', parameters: [idParam('id', 'Order id.')], requestBody: jsonBody({ type: 'object', properties: { name: { type: 'string' }, phone: { type: 'string' }, notes: { type: 'string' }, clear: { type: 'boolean' } } }), responses: { '200': { description: 'Delivery assigned/cleared.', content: { 'application/json': { schema: apiResponseOf({ type: 'object', properties: { order } }) } } } } },
    },

    // --------------------------------------------------------------- Coupons
    '/coupons/validate': {
      post: { tags: ['Coupons'], summary: 'Validate a coupon code against a cart subtotal', security: [], requestBody: jsonBody({ type: 'object', required: ['code', 'subtotal'], properties: { code: { type: 'string' }, subtotal: { type: 'number' }, guestEmail: { type: 'string' } } }), responses: { '200': { description: 'Coupon applied.', content: { 'application/json': { schema: apiResponseOf({ type: 'object', properties: { code: { type: 'string' }, discountAmount: { type: 'number' } } }) } } }, '400': commonErrorResponses['400'] } },
    },
    '/coupons/automatic': {
      get: { tags: ['Coupons'], summary: 'Get the best automatically-applied offer for a subtotal', security: [], parameters: [{ name: 'subtotal', in: 'query', schema: { type: 'number' } }], responses: { '200': { description: 'Best automatic offer, if any.', content: { 'application/json': { schema: apiResponseOf({ type: 'object', properties: { offer: { type: 'object', nullable: true } } }) } } } } },
    },
    '/coupons': {
      get: { tags: ['Coupons'], summary: '[Admin] List coupons', parameters: paginationParams, responses: { '200': { description: 'Paginated coupons.', content: { 'application/json': { schema: apiResponseOf({ type: 'object', properties: { coupons: { type: 'array', items: coupon }, pagination: paginationMetaSchema } }) } } } } },
      post: { tags: ['Coupons'], summary: '[Admin] Create a coupon', requestBody: jsonBody({ type: 'object', required: ['code', 'discountType', 'discountValue', 'validFrom', 'validUntil'], properties: { code: { type: 'string' }, discountType: { type: 'string', enum: ['percentage', 'flat'] }, discountValue: { type: 'number' }, validFrom: { type: 'string', format: 'date-time' }, validUntil: { type: 'string', format: 'date-time' } } }), responses: { '201': { description: 'Created.', content: { 'application/json': { schema: apiResponseOf({ type: 'object', properties: { coupon } }) } } }, '409': commonErrorResponses['409'] } },
    },
    '/coupons/{id}': {
      get: { tags: ['Coupons'], summary: '[Admin] Get a coupon by id', parameters: [idParam('id', 'Coupon id.')], responses: { '200': { description: 'Coupon.', content: { 'application/json': { schema: apiResponseOf({ type: 'object', properties: { coupon } }) } } } } },
      patch: { tags: ['Coupons'], summary: '[Admin] Update a coupon', parameters: [idParam('id', 'Coupon id.')], requestBody: jsonBody({ type: 'object', properties: { discountValue: { type: 'number' }, isActive: { type: 'boolean' } } }), responses: { '200': { description: 'Updated.', content: { 'application/json': { schema: apiResponseOf({ type: 'object', properties: { coupon } }) } } } } },
      delete: { tags: ['Coupons'], summary: '[Admin] Delete a coupon', parameters: [idParam('id', 'Coupon id.')], responses: { '200': { description: 'Deleted.', content: { 'application/json': { schema: apiResponseOf(null) } } } } },
    },
    '/coupons/{id}/usage': {
      get: { tags: ['Coupons'], summary: '[Admin] Get redemption history and summary stats for a coupon', parameters: [idParam('id', 'Coupon id.'), ...paginationParams], responses: { '200': { description: 'Usage.', content: { 'application/json': { schema: apiResponseOf({ type: 'object', properties: { code: { type: 'string' }, summary: { type: 'object' }, redemptions: { type: 'array', items: { type: 'object' } }, pagination: paginationMetaSchema } }) } } } } },
    },

    // --------------------------------------------------------------- Profile
    '/profile': {
      get: { tags: ['Profile'], summary: "Get the authenticated user's profile", responses: { '200': { description: 'Profile.', content: { 'application/json': { schema: apiResponseOf({ type: 'object', properties: { user } }) } } } } },
      patch: { tags: ['Profile'], summary: 'Update name/phone/avatar', requestBody: jsonBody({ type: 'object', properties: { name: { type: 'string' }, phone: { type: 'string' }, avatar: { type: 'string' } } }), responses: { '200': { description: 'Updated.', content: { 'application/json': { schema: apiResponseOf({ type: 'object', properties: { user } }) } } } } },
    },
    '/profile/avatar': {
      post: { tags: ['Profile'], summary: 'Set the profile picture URL (upload to Cloudinary client-side first)', requestBody: jsonBody({ type: 'object', properties: { avatar: { type: 'string', format: 'uri' } } }), responses: { '200': { description: 'Avatar updated.', content: { 'application/json': { schema: apiResponseOf({ type: 'object', properties: { user } }) } } } } },
    },
    '/profile/addresses': {
      put: { tags: ['Profile'], summary: 'Replace the saved address list', requestBody: jsonBody({ type: 'object', required: ['addresses'], properties: { addresses: { type: 'array', items: { type: 'string' }, maxItems: 10 } } }), responses: { '200': { description: 'Updated.', content: { 'application/json': { schema: apiResponseOf({ type: 'object', properties: { user } }) } } } } },
    },
    '/profile/orders': {
      get: { tags: ['Profile'], summary: "Recent orders preview (last 5 — see /orders for full paginated history)", responses: { '200': { description: 'Orders.', content: { 'application/json': { schema: apiResponseOf({ type: 'object', properties: { orders: { type: 'array', items: order } } }) } } } } },
    },
    '/profile/wishlist': {
      get: { tags: ['Profile'], summary: 'Get the paginated wishlist', parameters: paginationParams, responses: { '200': { description: 'Wishlist.', content: { 'application/json': { schema: apiResponseOf({ type: 'object', properties: { wishlist: { type: 'array', items: product }, pagination: paginationMetaSchema } }) } } } } },
    },
    '/profile/wishlist/{productId}': {
      post: { tags: ['Profile'], summary: 'Add a product to the wishlist', parameters: [idParam('productId', 'Product id.')], responses: { '200': { description: 'Added.', content: { 'application/json': { schema: apiResponseOf({ type: 'object', properties: { wishlist: { type: 'array', items: product } } }) } } } } },
      delete: { tags: ['Profile'], summary: 'Remove a product from the wishlist', parameters: [idParam('productId', 'Product id.')], responses: { '200': { description: 'Removed.', content: { 'application/json': { schema: apiResponseOf({ type: 'object', properties: { wishlist: { type: 'array', items: product } } }) } } } } },
    },
    '/profile/wallet': {
      get: { tags: ['Profile'], summary: 'Get wallet balance', responses: { '200': { description: 'Wallet.', content: { 'application/json': { schema: apiResponseOf({ type: 'object', properties: { wallet: { type: 'object', properties: { balance: { type: 'number' }, currency: { type: 'string' } } } } }) } } } } },
    },
    '/profile/notifications': {
      get: { tags: ['Profile'], summary: 'Get in-app notifications', responses: { '200': { description: 'Notifications.', content: { 'application/json': { schema: apiResponseOf({ type: 'object', properties: { notifications: { type: 'array', items: { type: 'object' } } } }) } } } } },
    },
    '/profile/change-password': {
      post: { tags: ['Profile'], summary: 'Change password (requires current password)', requestBody: jsonBody({ type: 'object', required: ['currentPassword', 'newPassword'], properties: { currentPassword: { type: 'string' }, newPassword: { type: 'string', minLength: 8 } } }), responses: { '200': { description: 'Password changed.', content: { 'application/json': { schema: apiResponseOf(null) } } }, '400': commonErrorResponses['400'] } },
    },
    '/profile/account': {
      delete: { tags: ['Profile'], summary: 'Deactivate (soft-delete) your own account', responses: { '200': { description: 'Deactivated.', content: { 'application/json': { schema: apiResponseOf(null) } } } } },
    },
    '/profile/support-tickets': {
      get: { tags: ['Profile'], summary: 'Get support tickets', responses: { '200': { description: 'Tickets.', content: { 'application/json': { schema: apiResponseOf({ type: 'object', properties: { supportTickets: { type: 'array', items: { type: 'object' } } } }) } } } } },
    },
    '/profile/recently-viewed': {
      get: { tags: ['Profile'], summary: 'Get server-tracked recently viewed products', responses: { '200': { description: 'Recently viewed.', content: { 'application/json': { schema: apiResponseOf({ type: 'object', properties: { recentlyViewed: { type: 'array', items: { type: 'object' } } } }) } } } } },
    },
    '/profile/reviews': {
      get: { tags: ['Profile'], summary: 'Get your own review history, paginated', parameters: paginationParams, responses: { '200': { description: 'Reviews.', content: { 'application/json': { schema: apiResponseOf({ type: 'object', properties: { reviews: { type: 'array', items: { type: 'object' } }, pagination: paginationMetaSchema } }) } } } } },
    },

    // --------------------------------------------------------- Admin Customers
    '/users': {
      get: { tags: ['Admin Customers'], summary: '[Admin] List customers (search/status filters, paginated)', parameters: [{ name: 'search', in: 'query', schema: { type: 'string' } }, { name: 'status', in: 'query', schema: { type: 'string', enum: ['active', 'blocked'] } }, ...paginationParams], responses: { '200': { description: 'Paginated customers.', content: { 'application/json': { schema: apiResponseOf({ type: 'object', properties: { customers: { type: 'array', items: user }, pagination: paginationMetaSchema } }) } } } } },
    },
    '/users/{id}': {
      get: { tags: ['Admin Customers'], summary: '[Admin] Get a customer by id', parameters: [idParam('id', 'Customer id.')], responses: { '200': { description: 'Customer.', content: { 'application/json': { schema: apiResponseOf({ type: 'object', properties: { customer: user } }) } } } } },
      delete: { tags: ['Admin Customers'], summary: '[Admin] Delete a customer account', parameters: [idParam('id', 'Customer id.')], responses: { '200': { description: 'Deleted.', content: { 'application/json': { schema: apiResponseOf(null) } } } } },
    },
    '/users/{id}/reviews': {
      get: { tags: ['Admin Customers'], summary: "[Admin] Get a customer's review history, paginated", parameters: [idParam('id', 'Customer id.'), ...paginationParams], responses: { '200': { description: 'Reviews.', content: { 'application/json': { schema: apiResponseOf({ type: 'object', properties: { reviews: { type: 'array', items: { type: 'object' } }, pagination: paginationMetaSchema } }) } } } } },
    },
    '/users/{id}/block': {
      patch: { tags: ['Admin Customers'], summary: '[Admin] Block a customer and revoke their sessions', parameters: [idParam('id', 'Customer id.')], requestBody: jsonBody({ type: 'object', properties: { reason: { type: 'string', maxLength: 300 } } }), responses: { '200': { description: 'Blocked.', content: { 'application/json': { schema: apiResponseOf({ type: 'object', properties: { customer: user } }) } } } } },
    },
    '/users/{id}/unblock': {
      patch: { tags: ['Admin Customers'], summary: '[Admin] Unblock a customer', parameters: [idParam('id', 'Customer id.')], responses: { '200': { description: 'Unblocked.', content: { 'application/json': { schema: apiResponseOf({ type: 'object', properties: { customer: user } }) } } } } },
    },
    '/users/{id}/reset-password': {
      post: { tags: ['Admin Customers'], summary: "[Admin] Email a customer a password reset link", parameters: [idParam('id', 'Customer id.')], responses: { '200': { description: 'Email sent.', content: { 'application/json': { schema: apiResponseOf(null) } } } } },
    },

    // -------------------------------------------------------------- Dashboard
    '/dashboard': {
      get: { tags: ['Dashboard'], summary: '[Admin] Get analytics dashboard data (TTL-cached)', parameters: [{ name: 'days', in: 'query', schema: { type: 'integer', enum: [7, 30, 90] } }], responses: { '200': { description: 'Dashboard data.', content: { 'application/json': { schema: apiResponseOf({ type: 'object' }) } } } } },
    },

    // --------------------------------------------------------------- Uploads
    '/uploads/signature': {
      get: { tags: ['Uploads'], summary: 'Get a signed Cloudinary upload signature for direct browser uploads', responses: { '200': { description: 'Signature params.', content: { 'application/json': { schema: apiResponseOf({ type: 'object', properties: { signature: { type: 'string' }, timestamp: { type: 'integer' }, apiKey: { type: 'string' }, cloudName: { type: 'string' } } }) } } } } },
    },

    // ------------------------------------------------------------ Newsletter
    '/newsletter/subscribe': {
      post: { tags: ['Newsletter'], summary: 'Subscribe an email to the newsletter', security: [], requestBody: jsonBody({ type: 'object', required: ['email'], properties: { email: { type: 'string', format: 'email' } } }), responses: { '201': { description: 'Subscribed.', content: { 'application/json': { schema: apiResponseOf(null) } } }, '429': { description: 'Rate limited.', content: { 'application/json': { schema: errorEnvelope } } } } },
    },
    '/newsletter/unsubscribe': {
      post: { tags: ['Newsletter'], summary: 'Unsubscribe an email from the newsletter', security: [], requestBody: jsonBody({ type: 'object', required: ['email'], properties: { email: { type: 'string', format: 'email' } } }), responses: { '200': { description: 'Unsubscribed.', content: { 'application/json': { schema: apiResponseOf(null) } } } } },
    },

    // ---------------------------------------------------------------- Contact
    '/contact': {
      post: { tags: ['Contact'], summary: 'Submit the public contact form', security: [], requestBody: jsonBody({ type: 'object', required: ['name', 'email', 'subject', 'message'], properties: { name: { type: 'string', minLength: 2, maxLength: 100 }, email: { type: 'string', format: 'email' }, subject: { type: 'string', minLength: 3, maxLength: 150 }, message: { type: 'string', minLength: 10, maxLength: 2000 } } }), responses: { '201': { description: 'Message received.', content: { 'application/json': { schema: apiResponseOf({ type: 'object', properties: { contactMessage } }) } } }, '429': { description: 'Rate limited.', content: { 'application/json': { schema: errorEnvelope } } } } },
      get: { tags: ['Contact'], summary: '[Admin] List contact messages, paginated', parameters: paginationParams, responses: { '200': { description: 'Paginated messages.', content: { 'application/json': { schema: apiResponseOf({ type: 'object', properties: { contactMessages: { type: 'array', items: contactMessage }, pagination: paginationMetaSchema } }) } } } } },
    },
    '/contact/{id}/status': {
      patch: { tags: ['Contact'], summary: '[Admin] Update a contact message status', parameters: [idParam('id', 'Contact message id.')], requestBody: jsonBody({ type: 'object', required: ['status'], properties: { status: { type: 'string', enum: ['new', 'read', 'resolved'] } } }), responses: { '200': { description: 'Updated.', content: { 'application/json': { schema: apiResponseOf({ type: 'object', properties: { contactMessage } }) } } } } },
    },
  },
};
