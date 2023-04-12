---
layout: post
title:  Kubernetes - 11 - DevOps
date:   2022-07-29 11:00:00 +0800
categories: 技术文档
tag: Kubernetes
---

* content
{:toc}


## 1. DevOps原则

![image.png](/images/blog/kubernetes/11-kubernetes-devops/01-devops-pricipal.png)

+ `文化（Culture）`：打破竖井、共担责任
+ `自动化（Automation）`：自动化所有重复手工流程
+ `精益（Lean）`：采用精益原则，消除浪费、优化价值流
+ `度量（Measurement）`：度量当前能力，发现进一步提升空间
+ `分享（Sharing）`：创建开放、分享的氛围，以保持目标一致，消除合作障碍


## 2. 团队模型

### 2.1 构建端到端负责的敏捷小分队——整体负责，荣辱与共
![image.png](/images/blog/kubernetes/11-kubernetes-devops/02-devops-team-work.png)

### 2.2 按照业务领域和康威定律划分大型团队
> 康威定律: “设计系统的架构受制于产生这些设计的组织的沟通结构。”通俗的来讲：产品必然是其（人员）组织沟通结构的缩影。

![image.png](/images/blog/kubernetes/11-kubernetes-devops/03-devops-organization.png)

## 3. 技术平台选型

### 3.1 Kubernetes vs 公有云原生

+ `团队阶段`：固化或者高速发展
    + 团队固化阶段采用kubernetes会更好一些，投入成本少，改造小
    + 团队高速发展或者变化阶段会导致基础设施资源频繁变更，kubernetes需要维护两层运维的精力，kubernetes基础设施层和应用层，而公有云则只需要维护应用层
+ `迁移成本`：kubernetes低，公有云高
+ `安全性`：kubernetes低，开源组织背书；公有云相对较高，云厂商背书
+ `学习门槛`：kubernetes低，公有云高
+ `功能定制化`：kubernetes由于是开源的，支持自定义，公有云相对来说是一个封闭的系统，几乎无定制化的可能性
+ `厂商绑定`：kubernetes无，公有云有厂商绑定的风险

### 3.2 自建Kubernetes vs 公有云托管Kubernetes

+ Kubernetes Master的管理
+ 集群的升级等相关维护性工作
+ 硬件维护
+ 网络设计
+ 安全性
+ 便利性


## 4. 云架构设计

### 4.1 原则
![image.png](/images/blog/kubernetes/11-kubernetes-devops/04-cloud-architecture-design.png)

### 4.2 架构设计
![image.png](/images/blog/kubernetes/11-kubernetes-devops/05-cloud-architecture-design-2.png)


## 5. 云迁移

### 5.1 云迁移策略

![image.png](/images/blog/kubernetes/11-kubernetes-devops/06-cloud-migration.png)

+ `Refactor 重构/重新架构` — 通过充分利用云原生功能来提高敏捷性、性能和可扩展性，移动应用程序并修改其架构。这通常涉及移植操作系统和数据库。例如：将本地Oracle数据库迁移到云的Mysql或者PostgreSQL,

+ `Replatform 重新平台` — 将应用程序移动到云端，并引入一定程度的优化以利用云功能。

+ `Repurchase 回购` — 切换到其他产品，通常通过从传统许可证转移到 SaaS 模式。例如：将客户关系管理 (CRM) 系统迁移到 Salesforce.com。

+ `Rehost 重新托管` — 将应用程序移动到云端，而无需进行任何更改以利用云功能。例如：将Mysql移动到云Mysql

+ `Relocate 重新定位` — 将基础设施迁移到云端，而无需购买新硬件、重写应用程序或修改现有操作。此迁移场景特定于 VMware CloudAWS，它支持虚拟机 (VM) 兼容性以及本地环境之间的工作负载可移植性AWS. 将基础架构迁移到 VMware Cloud 时，您可以使用本地数据中心中的 VMware Cloud Foundation 技术AWS. 例如：将托管 Oracle 数据库的虚拟机管理程序重新定位到 VMware 云AWS.

+ `Retain 保留` — 将应用程序保留在源环境中。其中可能包括需要进行大规模重构的应用程序，并且希望将该工作推迟到以后再进行，以及要保留的旧应用程序，因为迁移这些应用程序没有业务理由。

+ `Retire 停用` — 停用或删除源环境中不再需要的应用程序。

### 5.2 云迁移流程

![image.png](/images/blog/kubernetes/11-kubernetes-devops/07-cloud-migration-process.png)


## 6. 最佳实践

### 6.1 Pipeline设计
![image.png](/images/blog/kubernetes/11-kubernetes-devops/08-pipeline.png)

### 6.2 code flow设计
![image.png](/images/blog/kubernetes/11-kubernetes-devops/09-code-flow.png)

### 6.3 GitOps & Infrastructure as Code
![image.png](/images/blog/kubernetes/11-kubernetes-devops/10-infrastracture-as-code.png)
