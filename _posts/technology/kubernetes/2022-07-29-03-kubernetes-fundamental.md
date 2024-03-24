---
layout: post
title:  Kubernetes - 03 - 基础
date:   2022-07-29 03:00:00 +0800
categories: 技术文档
tag: Kubernetes
---

* content
{:toc}


![image.png](/images/blog/kubernetes/03-kubernetes-fundamental/01-kubernetes-overview.png)

## 1. 什么是Kubernetes

https://kubernetes.io/

+ kubernetes，简称K8s，是用8代替名字中间的8个字符“ubernete”而成的缩写。
+ Kubernetes是Google开源的一个生产级别的容器编排系统,用于管理云平台中多个主机上的容器化的应用
+ Kubernetes 是一个可移植、可扩展的开源平台，用于管理容器化的工作负载和服务，可促进声明式配置和自动化。

## 2. Kubernetes 特性

| 特性 | 描述 |
| --- | --- |
| 自动化上线和回滚 | Kubernetes 会分步骤地将针对应用或其配置的更改上线，同时监视应用程序运行状况以确保你不会同时终止所有实例。如果出现问题，Kubernetes 会为你回滚所作更改。你应该充分利用不断成长的部署方案生态系统。 |
| 服务发现与负载均衡 | 无需修改你的应用程序即可使用陌生的服务发现机制。Kubernetes 为容器提供了自己的 IP 地址和一个 DNS 名称，并且可以在它们之间实现负载均衡。 |
| 存储编排 | 自动挂载所选存储系统，包括本地存储、诸如 GCP 或 AWS 之类公有云提供商所提供的存储或者诸如 NFS、iSCSI、Gluster、Ceph、Cinder 或 Flocker 这类网络存储系统。 |
| Secret 和配置管理 | 部署和更新 Secrets 和应用程序的配置而不必重新构建容器镜像，且 不必将软件堆栈配置中的秘密信息暴露出来。 |
| 自动装箱 | 根据资源需求和其他约束自动放置容器，同时避免影响可用性。 将关键性的和尽力而为性质的工作负载进行混合放置，以提高资源利用率并节省更多资源。 |
| 批量执行 | 除了服务之外，Kubernetes 还可以管理你的批处理和 CI 工作负载，在期望时替换掉失效的容器。 |
| IPv4/IPv6 双协议栈 | 为 Pod 和 Service 分配 IPv4 和 IPv6 地址 |
| 水平扩缩 | 使用一个简单的命令、一个 UI 或基于 CPU 使用情况自动对应用程序进行扩缩。 |
| 自我修复 | 重新启动失败的容器，在节点死亡时替换并重新调度容器，杀死不响应用户定义的健康检查的容器，并且在它们准备好服务之前不会将它们公布给客户端。 |
| 为扩展性设计 | 无需更改上游源码即可扩展你的 Kubernetes 集群。 |

## 3. Kubernetes架构介绍

+ 一个 Kubernetes 集群是由一组被称作节点（node）的机器组成， 这些节点上会运行由 Kubernetes 所管理的容器化应用。 且每个集群至少有一个工作节点。

+ 工作节点会托管所谓的 Pods，而 Pod 就是作为应用负载的组件。 控制平面管理集群中的工作节点和 Pods。 为集群提供故障转移和高可用性， 这些控制平面一般跨多主机运行，而集群也会跨多个节点运行。

![image.png](/images/blog/kubernetes/03-kubernetes-fundamental/02-kubernetes-architecture.png)

+ 控制平面组件（Control Plane Components）
    + kube-apiserver: 该组件负责公开了 Kubernetes API，负责处理接受请求的工作, API Server是 Kubernetes 控制平面的前端。
    + etcd: etcd 是兼顾一致性与高可用性的键值数据库，可以作为保存 Kubernetes 所有集群数据的后台数据库。
    + kube-scheduler: 负责监视新创建的、未指定运行节点（node）的 Pods， 并选择节点来让 Pod 在上面运行。
    + kube-controller-manager: 是控制平面的组件， 负责运行控制器进程。从逻辑上讲， 每个控制器都是一个单独的进程， 但是为了降低复杂性，它们都被编译到同一个可执行文件，并在同一个进程中运行。
        + 节点控制器（Node Controller）：负责在节点出现故障时进行通知和响应
        + 任务控制器（Job Controller）：监测代表一次性任务的 Job 对象，然后创建 Pods 来运行这些任务直至完成
        + 端点控制器（Endpoints Controller）：填充端点（Endpoints）对象（即加入 Service 与 Pod）
        + 服务帐户和令牌控制器（Service Account & Token Controllers）：为新的命名空间创建默认帐户和 API 访问令牌
    + cloud-controller-manager: 是指嵌入特定云的控制逻辑的控制平面组件。 cloud-controller-manager 允许将你的集群连接到云提供商的 API 之上， 并将与该云平台交互的组件同与你的集群交互的组件分离开来。
        + 节点控制器（Node Controller）：用于在节点终止响应后检查云提供商以确定节点是否已被删除
        + 路由控制器（Route Controller）：用于在底层云基础架构中设置路由
        + 服务控制器（Service Controller）：用于创建、更新和删除云提供商负载均衡器
+ Node 组件
    + kubelet: 会在集群中每个节点（node）上运行。 它保证容器（containers）都运行在 Pod 中。kubelet 接收一组通过各类机制提供给它的 PodSpecs， 确保这些 PodSpecs 中描述的容器处于运行状态且健康。 kubelet 不会管理不是由 Kubernetes 创建的容器。
    + kube-proxy: kube-proxy 是集群中每个节点（node）上运行的网络代理，实现 Kubernetes 服务（Service）概念的一部分。kube-proxy 维护节点上的一些网络规则， 这些网络规则会允许从集群内部或外部的网络会话与 Pod 进行网络通信。
    + 容器运行时（Container Runtime）：容器运行环境是负责运行容器的软件。
    + 插件（Addons）：插件使用 Kubernetes 资源（DaemonSet、 Deployment 等）实现集群功能。 因为这些插件提供集群级别的功能，插件中命名空间域的资源属于 kube-system 命名空间。
        + DNS
        + Web 界面（仪表盘）
        + 容器资源监控 
        + 集群层面日志 

## 4. Kubernetes适用场景

+ 部署中使用容器
+ 多个service部署在多台服务器上
    + 微服务
    + 多租户
+ 大部分的服务是无状态的
+ 细粒度地控制网络
+ 追求易扩展的应用
+ 企业自建PaaS
+ 不希望被云厂商绑定

## 5. Kubernetes不适用场景

+ 不需要扩展性
+ 单体应用
+ 高度依赖本地硬盘存储
+ 部署服务器只有一台
+ IaaS