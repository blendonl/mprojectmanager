import { Module } from '@nestjs/common';
import { ChangesGateway } from './changes.gateway';

@Module({
  providers: [ChangesGateway],
  exports: [ChangesGateway],
})
export class WebSocketModule {}
