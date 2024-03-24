---
layout: post
title:  Kubernetes - 01 - Cloud & Cloud Native
date:   2022-07-29 01:00:00 +0800
categories: 技术文档
tag: Kubernetes
---

* content
{:toc}


![image.png](/images/blog/kubernetes/01-cloud-overview/01-cloud-overview.png)

## 1. Cloud

### 1.1 云计算发展历程

“云”中的资源在使用者看来是可以无限扩展的，并且可以随时获取，按需使用，随时扩展，按使用付费。这种特性经常被称为像水电一样使用IT基础设施。

![image.png](/images/blog/kubernetes/01-cloud-overview/02-cloud-path.png)

### 1.2 云服务模型

![image.png](/images/blog/kubernetes/01-cloud-overview/03-cloud-model.png)

### 1.3 云部署模型

![image.png](/images/blog/kubernetes/01-cloud-overview/04-cloud-deployment-model.png)

> TCO: Total Cost of Ownership

### 1.4 云的好处

![image.png](/images/blog/kubernetes/01-cloud-overview/05-cloud-benifit.png)

### 1.5 云的意义

+ `OPEX`: (operating expense) 指的是企业的管理支出、办公室支出、员工工资支出和广告支出等日常开支
+ `CAPEX`: (capital expenditure)一般指资金或固定资产、无形资产、递延资产等资产的投入


## 2. 云原生

### 2.1 什么是云原生

CNCF对Cloud Native的定义，出处[https://github.com/cncf/foundation/blob/main/charter.md](https://github.com/cncf/foundation/blob/main/charter.md)

> 云原生技术使组织能够在新式动态环境（如公有云、私有云和混合云）中构建和运行可缩放的应用程序。 容器、服务网格、微服务、不可变基础结构和声明性 API 便是此方法的范例。

> 这些技术实现了可复原、可管理且可观察的松散耦合系统。 它们与强大的自动化相结合，使工程师能够在尽量减少工作量的情况下，以可预测的方式频繁地进行具有重大影响力的更改。

### 2.2 云原生架构要点

+ DevOps
+ Microservices
+ Containers
+ Security

### 2.3 云原生架构的特征

+ 模块化（Modularity）
+ 可观测性（Observability）
+ 可部署性（Deployability）
+ 可测试性（Testability）
+ 可处理性（Disposability）
+ 可替代性（Replaceability）

### 2.4 云原生架构的形式

+ 符合12模式（Twelve-Factor App）：云原生应用架构的模式集合 [https://12factor.net/zh_cn/](https://12factor.net/zh_cn/)
+ 微服务架构（Microservices）：独立部署的服务，一次只做一件事
+ 自助服务敏捷基础设施（Self-Service Agile Infrastructure）：用于快速、可重复和一致地提供应用环境和服务的平台
+ 面向API接口的通信（API-based Collaboration）：服务之间的交互基于接口，而不是本地方法调用
+ 抗脆弱性（Anti-Fragility）：系统能抵御高负载

### 2.5 云原生应用价值

+ 异构资源标准化
    + 服务架构标准统一
    + 交付标准统一
    + 研运过程标准统一
+ 加速数字基础设施升级解放生产力
+ 提升业务应用的迭代速度，赋能业务创新

### 2.6 云原生的未来

+ 云原生底层技术
+ 云原生编排与管理
+ 云原生安全
+ 边缘计算
+ ServiceMesh
+ Serverless
