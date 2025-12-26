// src/utils/performanceMonitor.js

/**
 * Performance Monitoring Utility
 * Tracks and reports performance metrics for the application
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      pageLoad: null,
      firstContentfulPaint: null,
      largestContentfulPaint: null,
      timeToInteractive: null,
      totalBlockingTime: null,
      cumulativeLayoutShift: null,
      firstInputDelay: null,
    };
    this.observers = [];
    this.isEnabled = import.meta.env.VITE_PERFORMANCE_MONITORING !== 'false';
  }

  /**
   * Initialize performance monitoring
   */
  init() {
    if (!this.isEnabled || typeof window === 'undefined') {
      return;
    }

    // Wait for page load
    if (document.readyState === 'complete') {
      this.measurePerformance();
    } else {
      window.addEventListener('load', () => {
        setTimeout(() => this.measurePerformance(), 0);
      });
    }

    // Monitor Web Vitals
    this.observeWebVitals();
    
    // Monitor long tasks
    this.observeLongTasks();
    
    // Monitor memory usage (if available)
    this.observeMemory();
  }

  /**
   * Measure basic performance metrics
   */
  measurePerformance() {
    if (!window.performance || !window.performance.timing) {
      return;
    }

    const timing = window.performance.timing;
    const navigation = window.performance.getEntriesByType('navigation')[0];

    if (navigation) {
      this.metrics.pageLoad = navigation.loadEventEnd - navigation.fetchStart;
      this.metrics.domContentLoaded = navigation.domContentLoadedEventEnd - navigation.fetchStart;
      this.metrics.domInteractive = navigation.domInteractive - navigation.fetchStart;
    }

    // Measure paint metrics
    const paintEntries = window.performance.getEntriesByType('paint');
    paintEntries.forEach((entry) => {
      if (entry.name === 'first-contentful-paint') {
        this.metrics.firstContentfulPaint = entry.startTime;
      }
    });

    this.reportMetrics();
  }

  /**
   * Observe Web Vitals using PerformanceObserver
   */
  observeWebVitals() {
    if (!window.PerformanceObserver) {
      return;
    }

    // Largest Contentful Paint (LCP)
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.metrics.largestContentfulPaint = lastEntry.renderTime || lastEntry.loadTime;
        this.reportMetrics();
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(lcpObserver);
    } catch (e) {
      console.warn('LCP observer not supported:', e);
    }

    // First Input Delay (FID)
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.processingStart && entry.startTime) {
            this.metrics.firstInputDelay = entry.processingStart - entry.startTime;
            this.reportMetrics();
          }
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
      this.observers.push(fidObserver);
    } catch (e) {
      console.warn('FID observer not supported:', e);
    }

    // Cumulative Layout Shift (CLS)
    try {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        this.metrics.cumulativeLayoutShift = clsValue;
        this.reportMetrics();
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(clsObserver);
    } catch (e) {
      console.warn('CLS observer not supported:', e);
    }
  }

  /**
   * Observe long tasks (blocking the main thread)
   */
  observeLongTasks() {
    if (!window.PerformanceObserver) {
      return;
    }

    try {
      let totalBlockingTime = 0;
      const longTaskObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          // Long tasks are tasks that take more than 50ms
          const blockingTime = entry.duration - 50;
          if (blockingTime > 0) {
            totalBlockingTime += blockingTime;
          }
        });
        this.metrics.totalBlockingTime = totalBlockingTime;
        this.reportMetrics();
      });
      longTaskObserver.observe({ entryTypes: ['longtask'] });
      this.observers.push(longTaskObserver);
    } catch (e) {
      console.warn('Long task observer not supported:', e);
    }
  }

  /**
   * Observe memory usage (Chrome only)
   */
  observeMemory() {
    if (performance.memory) {
      const memoryInfo = {
        usedJSHeapSize: performance.memory.usedJSHeapSize,
        totalJSHeapSize: performance.memory.totalJSHeapSize,
        jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
      };
      
      this.metrics.memory = memoryInfo;
      
      // Monitor memory periodically
      setInterval(() => {
        if (performance.memory) {
          this.metrics.memory = {
            usedJSHeapSize: performance.memory.usedJSHeapSize,
            totalJSHeapSize: performance.memory.totalJSHeapSize,
            jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
          };
          this.reportMetrics();
        }
      }, 30000); // Every 30 seconds
    }
  }

  /**
   * Measure component render time
   * @param {string} componentName - Name of the component
   * @param {Function} renderFn - Render function to measure
   */
  measureComponent(componentName, renderFn) {
    if (!this.isEnabled) {
      return renderFn();
    }

    const start = performance.now();
    const result = renderFn();
    const end = performance.now();
    const duration = end - start;

    if (duration > 16) { // Warn if render takes more than one frame (16ms)
      console.warn(`[Performance] ${componentName} took ${duration.toFixed(2)}ms to render`);
    }

    return result;
  }

  /**
   * Report metrics to console or external service
   */
  reportMetrics() {
    if (import.meta.env.DEV) {
      // In development, log to console
      console.group('📊 Performance Metrics');
      console.table(this.metrics);
      console.groupEnd();
    }

    // Send to external service if configured
    const serviceUrl = import.meta.env.VITE_PERFORMANCE_SERVICE_URL;
    if (serviceUrl && this.isEnabled) {
      this.sendToService(serviceUrl, this.metrics);
    }
  }

  /**
   * Send metrics to external service
   * @param {string} url - Service URL
   * @param {Object} metrics - Metrics to send
   */
  async sendToService(url, metrics) {
    try {
      await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          url: window.location.href,
          userAgent: navigator.userAgent,
          metrics,
        }),
      });
    } catch (error) {
      console.error('Failed to send performance metrics:', error);
    }
  }

  /**
   * Get current metrics
   * @returns {Object} Current performance metrics
   */
  getMetrics() {
    return { ...this.metrics };
  }

  /**
   * Cleanup observers
   */
  cleanup() {
    this.observers.forEach((observer) => {
      try {
        observer.disconnect();
      } catch (e) {
        // Ignore errors
      }
    });
    this.observers = [];
  }
}

// Export singleton instance
const performanceMonitor = new PerformanceMonitor();
export default performanceMonitor;

