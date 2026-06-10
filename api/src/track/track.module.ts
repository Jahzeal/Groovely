import { Module } from '@nestjs/common';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { IpfsModule } from '../ipfs/ipfs.module';
import { TrackService } from './track.service';
import { TrackController } from './track.controller';

@Module({
  imports: [CloudinaryModule, IpfsModule],
  providers: [TrackService],
  controllers: [TrackController],
  exports: [TrackService],
})
export class TrackModule {}
