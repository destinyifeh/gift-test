import { 
  Controller, 
  Post, 
  UseInterceptors, 
  UploadedFile, 
  UseGuards, 
  Query,
  BadRequestException,
  Body
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileService } from './file.service';
import { AuthGuard } from '../../common/guards/auth.guard';

@Controller('files')
@UseGuards(AuthGuard)
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Query('folder') folder: string = 'general'
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Basic validation
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type');
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      throw new BadRequestException('File too large (max 5MB)');
    }

    const url = await this.fileService.uploadFile(file, folder);
    return { success: true, url };
  }
  @Post('delete')
  async deleteFile(@Body('url') url: string) {
    if (!url) {
      throw new BadRequestException('File URL is required');
    }
    
    await this.fileService.deleteFile(url);
    return { success: true };
  }
}
