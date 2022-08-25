import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
// import { Url } from "url";
import { BaseEntity } from "../base.entity";
import { User } from "../users";
import { IdentityEnum } from '@/enum/identity.enum';
@Entity()
export class Recruitment extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  // 存照
  @Column({ nullable: true, comment: '存照' })
  inchPhoto: string;

  // 第一志愿
  @Column({ type: 'enum', enum: IdentityEnum, nullable: false })
  firstChoice: IdentityEnum;

  // 第二志愿
  @Column({ type: 'enum', enum: IdentityEnum, nullable: false })
  secondChoice: IdentityEnum;

  // 是否调剂
  @Column({ type: 'bool', default: true, nullable: false })
  isAdjust: boolean;

  // 个人简历
  @Column({ type: 'longtext', nullable: false })
  curriculumVitae: string;

  // 竞选理由
  @Column({ type: 'longtext', nullable: true })
  reasonsForElection: string;

  // 是否已经投递
  @Column({ type: 'bool', default: false })
  isDeliver: boolean;

  // 是否已经截止
  @Column({ type: 'bool', default: false })
  isEnd: boolean;
}
