import { Global, Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { EntityEventEmitter } from './services/entity-event-emitter.service';

/**
 * Global Events Module
 * Provides entity change event broadcasting using Observer pattern
 * Available across the entire application
 */
@Global()
@Module({
  imports: [
    EventEmitterModule.forRoot({
      // Use wildcards for flexible event patterns
      wildcard: true,
      // Event delimiter for pattern matching
      delimiter: '.',
      // Enable newListener event
      newListener: false,
      // Remove listener event
      removeListener: false,
      // Maximum listeners per event (0 = unlimited)
      maxListeners: 10,
      // Show event name in memory leak message when exceeding maxListeners
      verboseMemoryLeak: false,
      // Disable throwing uncaught error if no error handler is present
      ignoreErrors: false,
    }),
  ],
  providers: [EntityEventEmitter],
  exports: [EntityEventEmitter],
})
export class EventsCoreModule {}
