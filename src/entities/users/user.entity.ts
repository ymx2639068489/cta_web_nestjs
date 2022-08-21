import {
  Entity,
  Column,
  JoinTable,
  PrimaryGeneratedColumn,
  ManyToOne,
} from 'typeorm';
import { BaseEntity } from '../base.entity';
import { UserIdentity } from './user-identity.entity';

@Entity('Users')
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;
  // 姓名
  @Column({
    comment: '姓名',
  })
  username: string;
  // 学号
  @Column({
    comment: '学号',
  })
  studentId: string;
  // 密码
  @Column({
    comment: '密码',
  })
  password: string;
  // 学院
  @Column({
    comment: '学院',
  })
  college: string;
  // 专业
  @Column({
    comment: '专业',
  })
  major: string;
  // 班级
  @Column({
    comment: '班级',
  })
  class: string;
  // QQ
  @Column({
    comment: 'QQ',
  })
  qq: string;
  // 身份
  @ManyToOne(() => UserIdentity, (userIdentity) => userIdentity.users)
  identity: UserIdentity;
}
