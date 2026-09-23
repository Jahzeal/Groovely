import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { ListeningRoomController } from './listening-room.controller';
import { ListeningRoomService } from './listening-room.service';
import { ListeningRoomGateway } from './listening-room.gateway';

@Module({
  imports: [DatabaseModule, CloudinaryModule],
  controllers: [ListeningRoomController],
  providers: [ListeningRoomService, ListeningRoomGateway],
  exports: [ListeningRoomService],
})
export class ListeningRoomModule {}
