---
layout: post
title:  微服务--使用Nexus Repository Manager 3.0搭建私有Docker仓库
date:   2018-06-05 10:50:00 +0800
categories: 微服务
tag: 教程
---

* content
{:toc}


下载
=============

下载最新的Nexus Repository Manager 3.0， [https://help.sonatype.com/repomanager3/download](https://help.sonatype.com/repomanager3/download)。并解压在某个目录，Windows下，官方不建议解压在“Program Files”或者“Program Files (x86)”目录，原因是空格和特殊字符。个人习惯是在c盘下创建一个"programs"的目录，专门安装这种解压即可用的软件。


启动
=============

linux下执行
-------------

{% highlight bash %}
./nexus run
{% endhighlight %}

windows下执行
-------------

{% highlight bash %}
nexus.exe /run
{% endhighlight %}

启动成功会打印如下信息
-------------

{% highlight bash %}
2018-06-05 10:56:15,582+0800 INFO  [jetty-main-1] *SYSTEM org.eclipse.jetty.server.AbstractConnector - Started ServerConnector@289fb2e9{HTTP/1.1,[http/1.1]}{0.0.0.0:8081}
2018-06-05 10:56:15,582+0800 INFO  [jetty-main-1] *SYSTEM org.eclipse.jetty.server.Server - Started @26802ms
2018-06-05 10:56:15,584+0800 INFO  [jetty-main-1] *SYSTEM org.sonatype.nexus.bootstrap.jetty.JettyServer -
-------------------------------------------------
Started Sonatype Nexus OSS 3.12.0-01
-------------------------------------------------
{% endhighlight %}


登录
=============

Nexus启动之后默认监听8081端口，访问[http://localhost:8081](http://localhost:8081)。

![/images/blog/micro-service/02-nexus-repository/01-visit.png](/images/blog/micro-service/02-nexus-repository/01-visit.png)

然后在右上角点击`Sign in`，使用默认`admin/admin123`用户名和密码登录，多了一个管理的标签，代表登录成功了。

![/images/blog/micro-service/02-nexus-repository/02-login.png](/images/blog/micro-service/02-nexus-repository/02-login.png)


创建Docker仓库
=============

在Nexus中Docker仓库被分为了三种
    
    + hosted： 托管仓库 ，私有仓库，可以push和pull 
    + proxy： 代理和缓存远程仓库 ，只能pull
    + group： 将多个proxy和hosted仓库添加到一个组，只访问一个组地址即可，只能pull

创建`hosted repository`
-------------

依次点击`管理BUTTON` -》 `Repository` -》 `Repositories` -》 `Create Repository` -》 `Docker(hosted)`, 然后在弹出的页面中填写如下信息。

![/images/blog/micro-service/02-nexus-repository/03-create-docker-hosted.png](/images/blog/micro-service/02-nexus-repository/03-create-docker-hosted.png)

其中选择Blob Store的时候是指想将相关内容存储在什么位置，如果不想存储在default中，可以先退出然后点击左侧Blob Stores -》 `Create Blob Store`先创建一个存储位置

![/images/blog/micro-service/02-nexus-repository/04-create-blob-stores.png](/images/blog/micro-service/02-nexus-repository/04-create-blob-stores.png)

创建`proxy repository`
-------------

依次点击`管理BUTTON` -》 `Repository` -》 `Repositories` -》 `Create Repository` -》 `Docker(proxy)`, 然后在弹出的页面中填写如下信息。

![/images/blog/micro-service/02-nexus-repository/05-create-docker-proxy.png](/images/blog/micro-service/02-nexus-repository/05-create-docker-proxy.png)

其中需要注意的是，在添加Proxy的Remote Storage的时候，需要选中`Use certificates Stored in the Nexus truststore to connect to external systems`， 然后点击`View Certificate`, 点击 `Add certificate to truststore`

![/images/blog/micro-service/02-nexus-repository/06-add-trust-store.png](/images/blog/micro-service/02-nexus-repository/06-add-trust-store.png)

创建`group repository`
-------------

依次点击`管理BUTTON` -》 `Repository` -》 `Repositories` -》 `Create Repository` -》 `Docker(group)`, 然后在弹出的页面中填写如下信息。

![/images/blog/micro-service/02-nexus-repository/07-create-docker-group.png](/images/blog/micro-service/02-nexus-repository/07-create-docker-group.png)

Repository完工
-------------

至此，Nexus Docker Repository 部分配置完成了


Docker配置
=============

由于本地Window下的Docker有问题，所以我选择的虚拟机下安装Linux来执行Docker，具体的Docker安装过程略过，本部分只涉及如何配置Docker从私服Pull和Push镜像。


配置daemon.json
-------------

其中192.168.59.1指安装Nexus的服务器地址

{% highlight bash %}
#vi /etc/docker/daemon.json
{
  "insecure-registries": [
    "192.168.59.1:8551",
    "192.168.59.1:8552",
    "192.168.59.1:8553"
  ],
  "disable-legacy-registry": true
}
{% endhighlight %}

重启Docker
-------------

{% highlight bash %}
#重启Docker服务
[root@localhost ~]# service docker restart
Redirecting to /bin/systemctl restart docker.service
#查看Docker服务运行状态
[root@localhost ~]# service docker status
Redirecting to /bin/systemctl status docker.service
● docker.service - Docker Application Container Engine
   Loaded: loaded (/usr/lib/systemd/system/docker.service; disabled; vendor preset: disabled)
   Active: active (running) since Mon 2018-06-04 13:00:17 EDT; 5s ago
{% endhighlight %}

创建镜像
-------------

{% highlight bash %}
[root@localhost docker]# mkdir docker
[root@localhost docker]# cd docker/
[root@localhost docker]# touch Dockerfile

[root@localhost docker]# vi Dockerfile
FROM debian
MAINTAINER Freud <luoyan35714@126.com>

CMD ["echo", "hello, this is freud!"]

[root@localhost docker]# docker build -t="hifreud" .
Sending build context to Docker daemon 2.048 kB
Step 1/3 : FROM debian
 ---> 8626492fecd3
Step 2/3 : MAINTAINER Freud <luoyan35714@126.com>
 ---> Running in 2695b8243d64
 ---> de27ed62ef24
Removing intermediate container 2695b8243d64
Step 3/3 : CMD echo hello, this is freud!
 ---> Running in ac5f9b2d1d01
 ---> 2e8231b2ab8d
Removing intermediate container ac5f9b2d1d01
Successfully built 2e8231b2ab8d
[root@localhost docker]# docker run hifreud
hello, this is freud!
{% endhighlight %}

Push镜像
-------------

{% highlight bash %}
[root@localhost docker]# docker tag hifreud 192.168.59.1:8551/freud:latest
#登录
[root@localhost docker]# docker login -u admin -p admin123 192.168.59.1:8551
Login Succeeded
[root@localhost docker]# docker push 192.168.59.1:8551/freud:latest
The push refers to a repository [192.168.59.1:8551/freud]
0f3a12fef684: Pushed 
latest: digest: sha256:f1a08c9b6066ecee674a56ea1effeb115dc0c31a4a741632730aa6d69abf7705 size: 529
{% endhighlight %}

登录nexus查看上传的镜像

![/images/blog/micro-service/02-nexus-repository/08-check-images.png](/images/blog/micro-service/02-nexus-repository/08-check-images.png)

Pull镜像
-------------

{% highlight bash %}
[root@localhost ~]# docker images
REPOSITORY                      TAG                 IMAGE ID            CREATED             SIZE
192.168.59.1:8551/freud         latest              2e8231b2ab8d        About an hour ago   101 MB
hifreud                         latest              2e8231b2ab8d        About an hour ago   101 MB
[root@localhost ~]# docker rmi -f 192.168.59.1:8551/freud
Untagged: 192.168.59.1:8551/freud:latest
Deleted: sha256:2e8231b2ab8d72cb506328635593c0303e72ce51f3e5806a63c41a41ead552de
Deleted: sha256:de27ed62ef247b09066669c0ed71113069544957b8e83eb105495398cb1d22ac
[root@localhost ~]# docker images
REPOSITORY                      TAG                 IMAGE ID            CREATED             SIZE
hifreud                         latest              2e8231b2ab8d        About an hour ago   101 MB
[root@localhost ~]# docker pull 192.168.59.1:8551/freud
Using default tag: latest
Trying to pull repository 192.168.59.1:8551/freud ... 
latest: Pulling from 192.168.59.1:8551/freud
cc1a78bfd46b: Already exists 
Digest: sha256:f1a08c9b6066ecee674a56ea1effeb115dc0c31a4a741632730aa6d69abf7705
Status: Downloaded newer image for 192.168.59.1:8551/freud:latest
[root@localhost ~]# docker images
REPOSITORY                      TAG                 IMAGE ID            CREATED             SIZE
192.168.59.1:8551/freud         latest              2e8231b2ab8d        2 hours ago         101 MB
hifreud                         latest              2e8231b2ab8d        About an hour ago   101 MB
{% endhighlight %}

搜索镜像
-------------

由于在创建docker repository的时候，在`Enable Docker V1 API`的时候，并没有选中`Allow clients to use the V1 API to interact with this Repository
`， 所以通过docker search直接检索private的repository或者images会报错，如下。

{% highlight bash %}
[root@localhost ~]# docker search 192.168.59.1:8553/freud
Error response from daemon: Unexpected status code 404
{% endhighlight %}

解决办法有两个，一个是在nexus上修改repository配置，设置`Enable Docker V1 API`是选中状态，另一种是通过V2的API来访问

{% highlight bash %}
#由于我们创建了Group Repository，所以此处IP可以是`192.168.59.1:8551`,也可以是`192.168.59.1:8553`
[root@localhost ~]# curl http://192.168.59.1:8551/v2/_catalog
{"repositories":["freud"]}
[root@localhost ~]# curl http://192.168.59.1:8553/v2/freud/tags/list
{"name":"freud","tags":["latest"]}
{% endhighlight %}


參考資料
=============

Using Nexus 3 as Your Repository - Part 3: Docker Images: [http://codeheaven.io/using-nexus-3-as-your-repository-part-3-docker-images/](http://codeheaven.io/using-nexus-3-as-your-repository-part-3-docker-images/)

sonatype nexus 3搭建Docker私有仓库:[https://blog.csdn.net/lusyoe/article/details/54926937](https://blog.csdn.net/lusyoe/article/details/54926937)

Installation Methods: [https://help.sonatype.com/repomanager3/installation/installation-methods](https://help.sonatype.com/repomanager3/installation/installation-methods)

docker私有镜像仓库搭建 : [https://www.2cto.com/kf/201702/594302.html](https://www.2cto.com/kf/201702/594302.html)