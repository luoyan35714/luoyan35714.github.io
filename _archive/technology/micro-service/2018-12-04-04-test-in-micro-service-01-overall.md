---
layout: post
title:  微服务架构下的测试之(一)-解决方案
date:   2018-12-04 20:05:00 +0800
categories: 技术文档
tag: 微服务
---

* content
{:toc}


问题
=============

在微服务的架构下，所有的业务被分拆成了一个个独立的个体，分别部署在集群的容器中，互相之间的调用形成了一个网状拓扑结构。这对之前的传统测试来说就是一种灾难。那基于微服务架构下的测试应该怎么做呢，下面介绍一个最佳实践。

测试方案
=============

+ 单元测试（Unit Test）: 是指对软件中的最小可测试单元进行检查和验证。
+ 冒烟测试（Smoke Test）: 这一术语源自硬件行业。对一个硬件或硬件组件进行更改或修复后，直接给设备加电。如果没有冒烟，则该组件就通过了测试。在软件中，冒烟测试设计用于确认代码中的更改会按预期运行，且不会破坏整个版本的稳定性。
+ 集成测试（Integration Test）: 将所有模块按照设计要求组装成为子系统或系统，进行集成测试。
+ 行为驱动开发（Behavior Driven Development）: 行为驱动开发是一种敏捷软件开发的技术，它鼓励软件项目中的开发者、QA和非技术人员或商业参与者之间的协作。

这几个测试分别对不同的阶段起作用，可以从下面这两张图来看具体每个测试所针对的作用域。

![](/images/blog/micro-service/04-test-in-micro-service/01-UT.png)

![](/images/blog/micro-service/04-test-in-micro-service/02-other-test.png)

通过上面两张图我们可以很清楚的看到：

单元测试要保证的是每个方法的正确性，即我们修改任意代码逻辑，只要单元测试可以通过，就可以保证我们的逻辑书写或修改是正确的，但前提是我们在践行敏捷开发中的TDD，即先写测试，然后开发。

冒烟测试要保证的就是单个应用的正确性，即在不依赖其他服务的情况下，当前服务是可以正常启动并且逻辑正确的。

集成测试要保证的是在整个微服务调用链中，从本服务开始，到所有被调用的微服务之间，业务逻辑是正确的。

行为驱动开发要保证的是从根微服务开始，甚至是从UI页面开始，整个业务逻辑的调用都是正确的，前提是我们在践行BDD，即先写测试，然后开发，或者测试和开发同时由不同的人进行。


测试技术
=============

以下只针对Java的技术来说，不同的测试我们可以采用如下的技术来实现。

| 单元测试 	| Mockito				|
| 冒烟测试 	| MockMvc + WireMock	|
| 集成测试 	| RestAssured 			|
| BDD		| Cucumber    			|

參考資料
=============

单元测试 : [https://baike.baidu.com/item/%E5%8D%95%E5%85%83%E6%B5%8B%E8%AF%95](https://baike.baidu.com/item/%E5%8D%95%E5%85%83%E6%B5%8B%E8%AF%95)

冒烟测试 ：[https://baike.baidu.com/item/%E5%86%92%E7%83%9F%E6%B5%8B%E8%AF%95/2166486?fr=aladdin](https://baike.baidu.com/item/%E5%86%92%E7%83%9F%E6%B5%8B%E8%AF%95/2166486?fr=aladdin)

集成测试 ：[https://baike.baidu.com/item/%E9%9B%86%E6%88%90%E6%B5%8B%E8%AF%95/1924552?fr=aladdin](https://baike.baidu.com/item/%E9%9B%86%E6%88%90%E6%B5%8B%E8%AF%95/1924552?fr=aladdin)

BDD : [https://baike.baidu.com/item/BDD/10735732?fr=aladdin](https://baike.baidu.com/item/BDD/10735732?fr=aladdin)
