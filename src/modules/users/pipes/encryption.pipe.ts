import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { MD5 } from 'crypto-js';
import { decrypt, encrypt } from '../../../common/utils/encryption';

@Injectable()
export class createUserPipe implements PipeTransform {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  transform(value: any, _metadata: ArgumentMetadata) {
    try {
      value.studentId = decrypt(value.studentId);
      value.qq = decrypt(value.qq);
    } catch {
      throw new BadRequestException('数据解析失败');
    }
    
    if (!value.studentId || !value.qq) {
      throw new BadRequestException(`decrypt error`);
    }
    value.password = MD5(value.password).toString();
    return value;
  }
}

@Injectable()
export class userLoginPipe implements PipeTransform {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  transform(value: any, _metadata: ArgumentMetadata) {
    const val = { ...value };
    try {
      val.studentId = decrypt(value.studentId);
    } catch (err) {
      throw new BadRequestException('数据解析失败');
    }
    val.password = MD5(val.password).toString();
    return val;
  }
}
