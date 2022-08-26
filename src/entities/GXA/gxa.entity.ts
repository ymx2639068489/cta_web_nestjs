import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../users';

@Entity()
export class Gxa {
  @PrimaryGeneratedColumn()
  id: number;

  // 第几届
  @Column({ type: 'int', default: new Date().getFullYear() })
  session: number;
  // 作品名称
  @Column()
  workName: string;

  // 小队名字
  @Column()
  teamName: string;

  // 组别, false -> 静态, true -> 动态
  @Column({ type: 'bool', default: false})
  group: boolean;

  // 队长 / 负责人
  @ManyToOne(() => User)
  @JoinColumn()
  leader: User;

  // 队员一
  @ManyToOne(() => User)
  @JoinColumn()
  teamMumber1: User;
  
  // 队员二
  @ManyToOne(() => User)
  @JoinColumn()
  teamMumber2: User;

  // 参赛团队学生特长
  @Column({ type: 'longtext' })
  teamMumberSpecialty: string;
  // 作品简介
  @Column({ type: 'longtext' })
  introductionToWorks: string;
}