---
layout: post
title:  Kubernetes - 02 - Docker
date:   2022-07-29 02:00:00 +0800
categories: 技术文档
tag: Kubernetes
---

* content
{:toc}


![image.png](/images/blog/kubernetes/02-docker-overview/01-docker-overview.png)

## 1. Docker 基础概念

https://www.docker.com/

### 1.1 Docker概述

+ Docker是一个用于开发、发布和运行应用程序的开放平台，也是一个开源的应用容器引擎，基于 Go 语言编写并遵从 Apache2.0 协议开源。

+ Docker能够将应用程序与基础架构分离，以便快速交付软件

+ 使用Docker，可以用与管理应用程序相同的方式管理基础设施

+ 通过利用Docker快速发布、测试和部署代码的方法，可以显著减少编写代码和在生产中运行代码之间的延迟。

+ Docker的目标"Build, Ship and Run any App, Anywhere"

### 1.2 Docker架构图

![image.png](/images/blog/kubernetes/02-docker-overview/02-docker-architecture.png)

### 1.3 Docker常见概念

+ Docker Object: Docker image & Docker Container，Container是用Image创建的运行实例，可以把容器看做是一个简易版本的Linux操作系统环境

+ Dokcer Deamon

+ Docker Client

+ Docker Desktop

+ Docker Registry

### 1.4 本地安装Docker

[https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)

### 1.5 Docker Image

![image.png](/images/blog/kubernetes/02-docker-overview/03-docker-image.png)


## 2. Docker 常用命令

### 2.1 镜像管理类命令

+ docker ps
+ docker pull
+ docker images
+ docker build 
+ docker tag
+ docker rmi

### 2.2 容器管理类命令
+ docker run
+ docker start
+ docker restart
+ docker exec -it ${container_id} sh
+ docker stop
+ docker rm
+ docker logs
+ docker network

### 2.3 统计类命令
+ docker stats
+ docker top
+ docker inspect
+ docker info

### 2.4 启动一个Demo项目

```bash
$ docker run hello-world
```

## 3. Docker运行底层原理

### 3.1 原理解析

Docker是一个Client-Server结构的系统，Docker守护进程运行在主机上，然后通过Socket连接从客户端访问，守护进程从客户端接收命令并管理运行在主机上的容器，容器是一个运行时环境。

![image.png](/images/blog/kubernetes/02-docker-overview/04-docker-principal.png)

### 3.2 Docker vs VM虚拟机

+ Docker有着比虚拟机更少的抽象层，由于Docker不需要Hypervisor实现硬件资源虚拟化，运行在Docker容器上的程序直接使用的都是实际物理机的硬件资源。因此在CPU,内存利用率上Docker将会在效率上有明显提升
+ Docker利用的是宿主机的内核，而不需要GuestOS，因此，当新建一个容器时，Docker不需要和虚拟机一样重新加载一个操作系统内容，因而避免了操作系统加载内核比较费时费资源的过程。当新建一个虚拟机时，虚拟机软件需要加载GuestOS，整个新建过程是分钟级别的。而Docker由于直接利用宿主机的操作系统，则省略了内核加载时间，因此新建一个Docker容器只需要几秒钟。(GuestOS：VM（虚拟机）里的的系统（OS）; HostOS：物理机里的系统（OS）)

![image.png](/images/blog/kubernetes/02-docker-overview/05-docker-vs-vm.png)

|    | Docker容器 | 虚拟机(VM) |
| -- | ---------- | -----------|
| 操作系统 | 与宿主机共享OS | 宿主机OS上运行虚拟机OS |
| 镜像大小 | MB级别，镜像小，便于存储与运输 | GB级别，镜像庞大(vmdisk, vdi等) |
| 启动速度 | 秒级 | 分钟级别 |
| 管理效率 | 管理简单 | 组件相互依赖，管理复杂 |
| 运行性能 | 与物理机一致，几乎无额外性能损失 | VM会占用一部分资源 |
| 移植性   | 轻便，灵活，适应于Linux | 笨重，与虚拟化技术耦合度高 |
| 隔离性   | 隔离性高 | 彻底隔离 |
| 网络管理 | 较弱 | 灵活的网络架构管理 |
| 可管理型 | 单进程，不建议启动SSH | 完整的管理系统 |
| 硬件亲和性 | 面向软件开发者 | 面向硬件运维者 |

### 3.3 Docker的局限性

+ Docker是基于Linux 64bit的，无法在32bit的linux/Windows/unix环境下使用
+ LXC(Linux Container)是基于cgroup等linux kernel功能的，因此container的guest系统只能是linux base的
+ 隔离性相比KVM之类的虚拟化方案还是有些欠缺，所有container公用一部分的运行库
+ 网络管理相对简单，主要是基于namespace隔离
+ cgroup的cpu和cpuset提供的cpu功能相比KVM的等虚拟化方案相比难以度量(所以dotcloud主要是按内存收费)
+ Docker对disk的管理比较有限
+ container随着用户进程的停止而销毁，container中的log等用户数据不便收集

## 4. Dockerfile

### 4.1 指令详解

+ `COPY`: 复制指令，从上下文目录中复制文件或者目录到容器里指定路径。

+ `ADD`: ADD 指令和 COPY 的使用格类似（同样需求下，官方推荐使用 COPY）。功能也类似
    + ADD 的优点：在执行 <源文件> 为 tar 压缩文件的话，压缩格式为 gzip, bzip2 以及 xz 的情况下，会自动复制并解压到 <目标路径>。
    + ADD 的缺点：在不解压的前提下，无法复制 tar 压缩文件。会令镜像构建缓存失效，从而可能会令镜像构建变得比较缓慢。具体是否使用，可以根据是否需要自动解压来决定。

+ `RUN`: 用于执行后面跟着的命令行命令。有以下俩种格式：
    + shell 格式：`RUN <命令行命令>`
    + exec 格式：`RUN ["可执行文件", "参数1", "参数2"]`

+ `CMD`:  为启动的容器指定默认要运行的程序，程序运行结束，容器也就结束。`CMD` 指令指定的程序可被`docker run`命令行参数中指定要运行的程序所覆盖。如果`Dockerfile` 中如果存在多个`CMD`指令，仅最后一个生效。类似于`RUN` 指令，用于运行程序，但二者运行的时间点不同。
    + `CMD` 在docker run 时运行。
    + `RUN` 是在 docker build。

+ `ENTRYPOINT`：类似于`CMD`指令，但其不会被 docker run 的命令行参数指定的指令所覆盖，而且这些命令行参数会被当作参数送给 ENTRYPOINT 指令指定的程序。但是, 如果运行`docker run`时使用了`--entrypoint`选项，将覆盖 ENTRYPOINT 指令指定的程序。
    + 优点：在执行 docker run 的时候可以指定 ENTRYPOINT 运行所需的参数。
    + 注意：如果 Dockerfile 中如果存在多个 ENTRYPOINT 指令，仅最后一个生效。

+ `ENV`: 设置环境变量，定义了环境变量，那么在后续的指令中，就可以使用这个环境变量。

+ `ARG`: 构建参数，与 ENV 作用一致。不过作用域不一样。ARG 设置的环境变量仅对 Dockerfile 内有效，也就是说只有 docker build 的过程中有效，构建好的镜像内不存在此环境变量。构建命令 docker build 中可以用 --build-arg <参数名>=<值> 来覆盖。

+ `EXPOSE`: 仅仅只是声明端口。具体容器内暴露服务端口由应用程序自身决定
    + 帮助镜像使用者理解这个镜像服务的守护端口，以方便配置映射。
    + 在运行时使用随机端口映射时，也就是 docker run -P 时，会自动随机映射 EXPOSE 的端口。

+ `WORKDIR`: 指定工作目录。
    + 用 WORKDIR 指定的工作目录，会在构建镜像的每一层中都存在
    + WORKDIR 指定的工作目录，必须是提前创建好的
    + docker build 构建镜像过程中的，每一个 RUN 命令都是新建的一层。只有通过 WORKDIR 创建的目录才会一直存在

+ `USER`：用于指定执行后续命令的用户和用户组
    + USER <用户名>[:<用户组>]

### 4.2 Docker Image镜像的分层结构

![image.png](/images/blog/kubernetes/02-docker-overview/06-docker-image-file.png)

+ 基于bootfs共享宿主机的kernal
+ base镜像提供的是最小的Linux发行版
+ 同一docker主机支持运行多种Linux发行版
+ 采用分层结构的最大好处是：共享资源
+ Copy-on-Write 可写容器层
+ 容器层以下所有镜像层都是只读的
+ docker从上往下依次查找文件
+ 容器层保存镜像变化的部分，并不会对镜像本身进行任何修改
+ 一个镜像最多127层


### 4.3 Dockerfile执行流程

+ (1）docker从基础镜像运行一个容器
+ (2）执行一条指令并对容器作出修改
+ (3）执行类似docker commit的操作提交一个新的镜像层
+ (4）docker再基于刚提交的镜像运行一个新容器
+ (5）执行dockerfile中的下一条指令直到所有指令都执行完成


## 5. Docker Network

Docker的五种网络模式分别为：

+ `Bridge`: 使用`--net=bridge`指定，bridge是dokcer网络的默认设置。安装完docker，系统会自动添加一个供docker使用的网桥bridge，创建一个新的容器时，容器通过DHCP获取一个与bridge同网段的IP地址。并默认连接到bridge网桥，以此实现容器与宿主机的网络互通

+ `Host`：使用`--net=host`指定，host模式下容器不会获得一个独立的network namespace，而是与宿主机共用一个。这就意味着容器不会有自己的网卡信息，而是使用宿主机的。容器除了网络，其他都是隔离的。同端口的应用只能启动一个

+ `None`：使用`--net=none`指定，获取独立的network namespace，但不为容器进行任何网络配置需要我们自己为容器添加网卡，配置IP。容器启动后没有接口ip，与外界无沟通，用于安全性比较高的业务

+ `Container`：使用`--net=container:NAME_or_ID`指定，与指定的容器使用同一个network namespace，具有同样的网络配置信息，两个容器除了网络，其他都还是隔离的。

+ `自定义network`：使用`--net=network_name`指定，与默认的bridge原理一样，但自定义网络具备内部DNS发现，可以通过容器名或者主机名容器之间网络通信。
    + 通过docker network create创建自定义的网络 `docker network create test`
    + 创建容器指定自定义网桥：`docker run -itd --name test6 --net=test busybox`

## 6. Docker Registry

    + Docker Registry：官方出品，简单易用，功能较少
    + Nexus: Sonatype公司产品，有开源和企业版本，企业版本功能更多
    + Artifactory: Jfrog公司产品，有开源版本和企业版本，企业版本功能更多
    + Harbor: OpenSource，CNCF毕业，VMWare公司捐赠，需要完全的自己运维
    + Quay: CoreOS产品，有开源版本和企业版本，企业版本功能更多


### 6.1 Harbor介绍

![image.png](/images/blog/kubernetes/02-docker-overview/07-harbor.png)

[https://goharbor.io/](https://goharbor.io/)

Harbor由VMware公司中国研发中心云原生实验室原创的企业级DockerRegistry项，其目标是帮助用户迅速搭建一个企业级的Dockerregistry服务，并于2016年3月开源。

Harbor在Docker Distribution的基础上增加了企业用户必需的权限控制、镜像签名、安全漏洞扫描和远程复制等重要功能，还提供了图形管理界面及面向国内用户的中文支持，

### 6.2 harbor在centos的安装

#### 6.2.1 时间同步

```yaml
# 设置正确的时区
$ timedatectl set-timezone Asia/Shanghai
# 将当前的 UTC 时间写入硬件时钟
$ timedatectl set-local-rtc 0
# 重启依赖于系统时间的服务
$ systemctl restart rsyslog
# 时间同步
$ yum install ntpdate -y
$ ntpdate time.windows.com
```
#### 6.2.2 下载并解压harbor的安装文件

[https://github.com/goharbor/harbor/releases](https://github.com/goharbor/harbor/releases)
下载并解压`harbor-offline-installer-v2.5.2.tgz`文件

```bash
$ tar -zxvf harbor-offline-installer-v2.5.2.tgz
```

#### 6.2.3 修改harbor的配置文件

```bash
$ cd harbor
$ cp harbor.yml.tmpl harbor.yml
$ vi harbor.yaml
# 设置hostname为当前的服务器
hostname: 172.16.140.161
# 设置harbor启动的密码
harbor_admin_password: 12345

# 注释掉所有的https相关的配置
# https related config
#https:
  # https port for harbor, default is 443
#  port: 443
  # The path of cert and key files for nginx
 # certificate: /your/certificate/path
 # private_key: /your/private/key/path
```

#### 6.2.4 安装最新版docker

```bash
# 卸载之前安装的docker
$ sudo yum remove docker \
              docker-client \
              docker-client-latest \
              docker-common \
              docker-latest \
              docker-latest-logrotate \
              docker-logrotate \
              docker-selinux \
              docker-engine-selinux \
              docker-engine

# 使用源（推荐国内阿里源或或者清华源，官方源比较慢）
$ curl -L http://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo -o /etc/yum.repos.d/docker-ce.repo
# 更新yum缓存
$ yum makecache fast
# 安装
$ yum install -y docker-ce
# 启动
$ systemctl start docker
# 查看docker版本
$ docker version
```

#### 6.2.5 安装最新版docker-compose

```bash
# 下载docker-compose 
$ sudo curl -L "https://github.com/docker/compose/releases/download/1.23.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose 
# 添加可执行权限
$ sudo chmod +x /usr/local/bin/docker-compose 
# 查看docker-compose版本
$ docker-compose --version
```

#### 6.2.6 安装harbor

```bash
$ ./install.sh
[Step 0]: checking if docker is installed ...
[Step 1]: checking docker-compose is installed ...
[Step 2]: loading Harbor images ...
[Step 3]: preparing environment ...
[Step 4]: preparing harbor configs ...
[Step 5]: starting Harbor ...
```

#### 6.2.7 访问harbor管理页面

用户名`admin`, 密码`12345`

![image.png](/images/blog/kubernetes/02-docker-overview/08-harbor-management.png)

#### 6.2.8 客户端push image到harbor

```
$ docker login 172.16.140.161
Username: admin
Password: 
Login Succeeded
$ docker pull nginx
$ docker tag nginx 172.16.140.161/freud/nginx:latest 
$ docker push 172.16.140.161/freud/nginx:latest 
The push refers to repository [172.16.140.161/freud/nginx]
Get "https://172.16.140.161/v2/": Service Unavailable

# 修改/etc/docker/daemon.json, 添加如下信息
# { "insecure-registries":["172.16.140.161"] }
$ docker push 172.16.140.161/freud/nginx:latest 
The push refers to repository [172.16.140.161/freud/nginx]
e7344f8a29a3: Pushed 
44193d3f4ea2: Pushed 
41451f050aa8: Pushed 
b2f82de68e0d: Pushed 
d5b40e80384b: Pushed 
08249ce7456a: Pushed 
latest: digest: sha256:3536d368b898eef291fb1f6d184a95f8bc1a6f863c48457395aab859fda354d1 size: 1570
```

#### 6.2.9 harbor管理页面查看image

![image.png](/images/blog/kubernetes/02-docker-overview/09-harbor-images.png)