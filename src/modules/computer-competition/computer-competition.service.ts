import { Injectable } from '@nestjs/common';
import { TestPaper, Question } from '@/entities/computerKnowledge';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { UserService } from '../user/user.service';
import { TestPaperEndDto } from '@/dto/computerKnowledge';
import { Api } from '@/common/utils/api';
import { TopicType } from '@/enum/TopicType';

@Injectable()
export class ComputerCompetitionService {
  constructor(
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
    @InjectRepository(TestPaper)
    private readonly testPaperRepository: Repository<TestPaper>,
    private readonly userService: UserService,
  ) {}

  // 获取榜单
  async findAll(page: number, pageSize: number) {
    const [list, total] = await this.testPaperRepository.findAndCount({
      where: { score: Not(IsNull()) },
      relations: ['user'],
      skip:(page - 1) * pageSize,
      take: pageSize,
      order: {
        score: 'DESC',
        totalDuration: 'ASC'
      }
    })
    return Api.pagerOk({
      total: Math.ceil(total / pageSize),
      list: list.map((item: TestPaper) => {
        return {
          studentId: item.user.studentId,
          score: item.score,
          totalDuration: item.totalDuration
        }
      }),
      page,
      limit: pageSize
    })
  }
  // 开始答题
  async start(user: any) {
    const item = await this.testPaperRepository.findOne({
      where: { user }
    })
    if (item?.score) return { code: -2, message: '用户已经答题过了' }
    const data = {
      singleChoice: [],
      MultipleChoice: [],
      Judgmental: []
    }
    data.singleChoice = (await this.questionRepository.query(
      'select id from question where type = 1 order by rand() limit 4'
    )).map((item: Question) => item.id)
    data.MultipleChoice = (await this.questionRepository.query(
      'select id from question where type = 2 order by rand() limit 2'
    )).map((item: Question) => item.id)
    data.Judgmental = (await this.questionRepository.query(
      'select id from question where type = 3 order by rand() limit 2'
    )).map((item: Question) => item.id)
    try {
      const questions = JSON.stringify([
        ...data.singleChoice,
        ...data.MultipleChoice,
        ...data.Judgmental,
      ])
      await this.testPaperRepository.save(
        this.testPaperRepository.create({
          user,
          questions,
          startTime: new Date()
        })
      )
      return Api.ok(data)
    } catch (err) {
      return { code: -1, message: err.message }
    }
  }
  // 结束答题
  async end(user: any, testPaperEndDto: TestPaperEndDto) {
    const item = await this.testPaperRepository.findOne({
      where: { user }
    })
    if (item.score) return { code: -4, messae: '已经做过了' }
    const userAns = []
    let score: number = 0;
    for (const key in testPaperEndDto.questions) {
      userAns.push({ key, value: testPaperEndDto.questions[key] })
    }
    await Promise.all(userAns.map(async (item) => {
      const _res = await this.questionRepository.findOne({
        select: ['ans', 'type'],
        where: { id: item.key }
      })
      if ((_res.ans & item.value) === item.value) {
        if (_res.type === 2) score += 2;
        else score ++;
      }
    }))
    try {
      const _t = await this.testPaperRepository.findOne({ where: { user } })
      const totalDuration = new Date().getTime() - new Date(_t.startTime).getTime()
      await this.testPaperRepository.save(
        await this.testPaperRepository.preload({
          ..._t,
          totalDuration,
          score
        })
      )
      return Api.ok({ score })
    } catch (err) {
      return { code: -1, message: err.message }
    }
  }
  // 获取自己的题目
  async getSelfQuestion(user: any) {
    const paper = await this.testPaperRepository.findOne({
      select: ['questions'],
      where: { user }
    })
    if (!paper) {
      return { code: -1, message: '当前用户尚未开始做题' }
    }
    return Api.ok(JSON.parse(paper.questions))
  }
  // 通过id 查询题目
  async findOneById(user: any, id: number) {
    const paper = await this.testPaperRepository.findOne({
      select: ['questions'],
      where: { user }
    })
    if (!paper) {
      return { code: -1, message: '当前用户尚未开始做题' }
    }
    if (!JSON.parse(paper.questions).includes(id)) {
      return { code: -2, message: '非法访问，你查询的题目不是你做的' }
    }
    return Api.ok(await this.questionRepository.findOne({ where: { id } }))
  }
}
