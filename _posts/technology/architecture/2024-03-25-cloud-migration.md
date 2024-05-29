---
layout:       post
title:        云迁移的一些经验和思考
date:         2024-03-25 22:39:00 +0800
categories:   技术文档
tag:          architecture
---

* content
{:toc}


## 背景

最近这几年云相关的概念特别火，依托于企业数字化转型，要达到降本增效的目的，很多企业都在做企业上云业务，包括自己自从19年加入IBM之后，接近一半的时间在做云迁移工作，最近项目没有那么忙，刚好有时间整理下一个应用从传统的机房部署迁移到云平台相关的内容。

首先，要做云转型，一定要拿到企业或团队主要负责人的全力支持，因为转型路上会触碰到很多既得利益者的利益，会将企业内部蛋糕重新分配，会淘汰掉一批人或者置换掉一批人。所以在开始云迁移改造之前，一定要拿到企业或者团队主要责任人的全力支持，避免出现费力不讨好，事情做一半烂尾的结局。


## 什么是云迁移

什么是云迁移呢，相信在当今这个云概念普及程度相对较高的时间点，每个人心中都对云迁移的理解。我觉得云迁移跟把大象放进冰箱里这个话题还挺像的。

相信大家都知道这个笑话，把大象装进冰箱里分几步？三步：

- 把冰箱门打开
- 把大象装进去
- 把冰箱门关上

但是如果把这个话题眼展开来谈，大象是什么样的大象，大象有多大，是活得还是死的，冰箱是什么品牌的冰箱，冰箱有多大，是几开门的冰箱，装进去是要冷冻还是冷藏，怎么把大象装进冰箱里，要使用什么样的工具。我想这就是我们架构师在应用上云时要考虑的事情。要把每一件事从概念细化到可落地。


## 为什么上云？

从企业的角度来看，上云会给企业带来以下几点好处:
+ 降低IT设施成本: 企业无需购买大量硬件和软件，减少运维成本。即从CAPEX（Capital Expenditure）转向OPEX（Operating Expense）
+ 系统稳定性: 将系统运维工作交给更专业的团队或公司来进行，提升系统的稳定性
+ 加快部署速度: 通过最新的CICD工具，加快代码部署速度
+ 提高团队的容错性: 允许团队内部试错并出错，能够通过云的能力，快速补救。


## 步骤

![01-migration-steps.png](/images/blog/architecture/cloud-migration/01-migration-steps.png)


## 方法论

+ AWS 7R
![02-7-R-1024x516.png](/images/blog/architecture/cloud-migration/02-7-R-1024x516.png)

+ IBM Garage 
[https://www.ibm.com/cn-zh/garage](https://www.ibm.com/cn-zh/garage)

+ 华为云迁移流程方法
[https://www.huaweicloud.com/zhishi/edu-arc-yqy22.html](https://www.huaweicloud.com/zhishi/edu-arc-yqy22.html)

## 云平台的选择

![03-cloud-platforms.png](/images/blog/architecture/cloud-migration/03-cloud-platforms.png)

## 云部署模型的选择

![04-cloud-models.png](/images/blog/architecture/cloud-migration/04-cloud-models.png)

## 云技术的选择
是openshift还是kubernetes，是openstack还是mesos？ 是使用公有云的自身的编排服务，还是使用云上的Kubernetes，还是采购虚机自建云平台。是使用云上的数据库，还是使用ECS自己搭建数据库。

具体技术的选型通常要根据团队的配置，企业的性质，结合更多的当前环境综合考虑下做出选择。

+ 成本
+ 团队
+ 技术储备
+ 控制权
+ 项目类型(自研还是外包交付)
+ 安全
+ 可迁移性
+ 实施难度
+ 开发效率/迁移效率
+ 二次开发
+ 技术支持


## 团队的选择

需要考虑的因素
+ 实施速度
+ 实施成本
+ 管理成本
+ 沟通成本
+ 技术统一性
+ 创新性
+ 后期运维
+ 团队冗余人员安置


## 挑战

### 宏观上看：
- 技术储备
- 成本
- 网络
- 安全
- 组织架构

### 微观上
- 高可用
- 流量切换
- 代码管理
- 双活
- 数据一致性
- 业务连续性
- 权限管理
- 灾备

## 技巧

1. 要有compare system
2. 旧数据和系统保留一段时间
3. 流量切换
3. 充分沟通和测试
4. 对所有系统进行摸排和排序，梳理优先级和互相依赖关系，分批次上云
4. 基础设施即代码
5. 尽量少地改造原有系统，争取在上云之后再做应用现代化的改造。
6. 按照最低权限+职责分离的原则设计权限管理模型，做到云上所有操作是可追踪回溯的。

## 总结

+ 云上成本不一定会低于传统部署成本，通常基础设施成本会更高
+ 上云是多个团队合作的成果，而不是某一个团队的目标
+ 上云通常伴随着组织结构变更
+ 上云是助力企业发展的起点，而不是终点