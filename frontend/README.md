# Digital Twin Gas Turbine Dashboard

Industrial Gas Turbine Compressor (IGT-12MW Class) Dashboard - A comprehensive solution for monitoring, predictive maintenance, and closed-loop optimization.

## 🚀 Features

- **Real-Time Monitoring (RTM)**: Live detection and visualization of current operating conditions
- **Predictive Maintenance (PdM)**: Forecasting equipment failures and Remaining Useful Life (RUL)
- **Real-Time Optimization (RTO)**: Dynamic calculation and execution of optimal control setpoints
- **Data Validation & Reconciliation (DVR)**: Process of detecting and correcting faulty sensor readings
- **3D Visualization**: Interactive 3D model of the gas turbine
- **Advanced Analytics**: Comprehensive charts and data analysis

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Modern browser (Chrome, Firefox, Edge, Safari)

## 🛠️ Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📜 Available Scripts

### Development
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Code Quality
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors automatically
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run type-check` - Run TypeScript type checking
- `npm run quality` - Run all quality checks (lint + format + type-check)

### Testing
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report

### Analysis
- `npm run build:analyze` - Build and generate bundle analysis report

## 🏗️ Project Structure

```
frontend/
├── src/
│   ├── api/              # API clients and endpoints
│   ├── app/               # Redux store configuration
│   ├── components/        # Reusable React components
│   ├── features/          # Feature-based Redux slices
│   ├── hooks/             # Custom React hooks
│   ├── layouts/           # Layout components
│   ├── pages/             # Page components
│   ├── routes/            # Routing configuration
│   ├── theme/             # Material-UI theme
│   └── utils/             # Utility functions
├── public/                # Static assets
├── dist/                  # Build output
└── package.json
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the `frontend` directory:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:5000/api

# WebSocket Configuration
VITE_SOCKET_URL=http://localhost:5000

# Error Logging
VITE_ERROR_LOGGING_ENABLED=true
VITE_ERROR_LOGGING_SERVICE_URL=

# Performance Monitoring
VITE_PERFORMANCE_MONITORING=true
VITE_PERFORMANCE_SERVICE_URL=
```

## 🎨 Code Style

This project uses:
- **ESLint** for linting (with strict rules)
- **Prettier** for code formatting
- **TypeScript** for type safety (gradual migration)

### Formatting

Code is automatically formatted with Prettier. Configuration is in `.prettierrc`.

### Linting

ESLint rules are configured in `eslint.config.js`. Run `npm run lint` to check for issues.

## 📊 Performance Monitoring

The application includes built-in performance monitoring that tracks:
- Page load time
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- First Input Delay (FID)
- Cumulative Layout Shift (CLS)
- Total Blocking Time (TBT)
- Memory usage (Chrome only)

Performance metrics are logged to the console in development mode and can be sent to an external service in production.

## 📦 Bundle Analysis

To analyze bundle size:

```bash
npm run build:analyze
```

This will generate a `dist/stats.html` file that you can open in your browser to visualize the bundle composition.

## 🔒 Security Features

- **Session Storage**: Tokens stored in sessionStorage (not localStorage) for better XSS protection
- **CSRF Protection**: Double Submit Cookie pattern implementation
- **WebSocket Authentication**: All WebSocket connections require authentication
- **Error Logging**: Comprehensive error tracking and reporting

## 🧪 Testing

Tests are written using Jest and React Testing Library. Test files should be placed next to the components they test with a `.test.js` or `.test.jsx` extension.

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 📚 Documentation

### API Documentation

API clients are documented with JSDoc comments. See:
- `src/api/apiClient.ts` - Main API client
- `src/api/webSocketClient.ts` - WebSocket client

### Component Documentation

Components include JSDoc comments explaining their purpose, props, and usage examples.

## 🐛 Troubleshooting

### Build Errors

If you encounter build errors:

1. Clear node_modules and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. Clear Vite cache:
   ```bash
   rm -rf node_modules/.vite
   ```

### Performance Issues

1. Check bundle size with `npm run build:analyze`
2. Review performance metrics in browser console
3. Use React DevTools Profiler to identify slow components

## 🤝 Contributing

1. Follow the code style guidelines (ESLint + Prettier)
2. Write tests for new features
3. Update documentation as needed
4. Run `npm run quality` before committing

## 📄 License

[Your License Here]

## 🔗 Resources

- [React Documentation](https://react.dev)
- [Redux Toolkit](https://redux-toolkit.js.org)
- [Material-UI](https://mui.com)
- [Vite](https://vitejs.dev)
- [TypeScript](https://www.typescriptlang.org)

---

**Last Updated:** 2025-01-27
