---
layout: post
title:  微服务架构下的测试之(二)-单元测试
date:   2018-12-05 20:05:00 +0800
categories: 技术文档
tag: 微服务
---

* content
{:toc}


单元测试（Unit Test）
=============

单元测试（Unit Test）是指对软件中的最小可测试单元进行检查和验证。在java中,单元指一个类。 -- 此处摘录自百度

> 在Java中，笔者更认可单元指的是方法，我们针对方法进行测试而不是类。

测试方案
=============

在微服务中的单元测试跟常规项目的单元测试是一样的。

举个例子，我们有ClassA，在ClassA中有三个方法，分别是methodA, methodB, methodC。那我们的测试方案就是针对ClassA创建一个ClassATest类，并在类中针对每个方法的多个场景进行测试，并且尽量考虑正常情况和异常情况，包括各种临界值的场景。如下图。

![](/images/blog/micro-service/04-test-in-micro-service/01-UT.png)


项目代码
=============

比如我们有一个Product项目，是维护商品信息的，其中的Controller和Service层代码如下。

controller
-------------

service
-------------


测试代码
=============

pom.xml
-------------

ControllerTest
-------------

ServiceTest
-------------

完整代码
=============

请参照 GITHUB []()


參考資料
=============

单元测试 : [https://baike.baidu.com/item/%E5%8D%95%E5%85%83%E6%B5%8B%E8%AF%95](https://baike.baidu.com/item/%E5%8D%95%E5%85%83%E6%B5%8B%E8%AF%95)
