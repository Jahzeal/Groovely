import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { ListeningRoomController } from './listening-room.controller';
import { ListeningRoomService } from './listening-room.service';
import { ListeningRoomGateway } from './listening-room.gateway';

@Module({
  imports: [DatabaseModule],
  controllers: [ListeningRoomController],
  providers: [ListeningRoomService, ListeningRoomGateway],
  exports: [ListeningRoomService],
})
export class ListeningRoomModule {}
