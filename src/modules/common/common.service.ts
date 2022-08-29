import { Injectable } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import { Result } from '@/common/interface/result';
@Injectable()
export class CommonService {
  private readonly staticBasePath: string = path.join(__dirname, '../../../static');

  async uploadFile(file: Express.Multer.File): Promise<Result<string>> {
    const fileName = Math.random().toString(36).slice(-8);
    const filePath = `${this.staticBasePath}/public/${fileName}.jpg`;
    try {
      fs.writeFileSync(filePath, file.buffer)
      return { code: 0, message: '上传成功', data: `/api/static/public/${fileName}`}
    } catch (err) {
      return { code: -1, message: err }
    }
  }
}
