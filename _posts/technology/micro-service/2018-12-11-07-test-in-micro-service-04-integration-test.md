---
layout: post
title:  微服务架构下的测试之(四)-集成测试(Integration Test)
date:   2018-12-11 21:07:00 +0800
categories: 技术文档
tag: 微服务
---

* content
{:toc}


集成测试（Integration Test）
=============

集成测试（Integration Test） ： 将所有模块按照设计要求组装成为子系统或系统，进行集成测试。

在微服務的架構下，我們可以使用集成測試來保證在整个微服务调用链中，从本服务开始，到所有被调用的微服务之间，业务逻辑是正确的。


测试方案
=============

举个例子，我们有三个微服务，一个是Gateway， 一个是ServiceA， 一个是ServiceB，它们的调用关系如下图。 现在要上线的是ServiceA，我们需要保证的是从ServiceA开始，到ServiceB的调用都是正常的。在此处即ServiceA调用ServiceB是正常的。

![](/images/blog/micro-service/07-integration-test/01-Integration-Test.png)

针对集成测试可以使用[RestAssured](http://rest-assured.io/)来实现。

这个方案乍看起来是没什么问题的，但仔细推敲就会发现，RestAssured是对已部署的rest接口进行测试，但是真正在项目mvn test阶段项目还没有部署。就会陷入一个鸡下蛋，蛋生鸡的问题。项目还没部署，无法测试，未测试通过，项目不能部署。解决方案是通过Maven的插件[]()，修改微服务上线的流程为如下：

{% highlight text %}
mvn clean install // skip the IT tests at this phase
//deploy service...
mvn test // execute the IT tests
{% endhighlight %}


项目代码
=============

依旧拿之前在SmoketTest中的例子，有一个下单的流程，我们有4个微服务，分别是ms-gateway, ms-service, ms-product, ms-order. 其中

| ms-gateway | 负责gateway功能，所有微服务在一个子网，保证只有gateway可以与外网交互 |
| ms-service | 负责业务逻辑的处理 |
| ms-product | 负责产品信息的维护和库存的维护 |
| ms-order   | 负责订单信息的维护 |

具体的调用时序图如下：

![](/images/blog/micro-service/07-integration-test/02-order-project.png)

现在我们要部署ms-service项目，并且相对其进行集成测试。那我们要保证的就是ms-service, ms-product, ms-order之间的正常调用。

ms-sercice项目controller层代码如下：

{% highlight java %}
{% endhighlight %}


测试代码
=============

那么我们就可以使用[RestAssured](http://rest-assured.io/)对这个项目进行测试，如下

pom.xml
-------------

{% highlight xml %}
<dependency>
  <groupId>com.jayway.restassured</groupId>
  <artifactId>rest-assured</artifactId>
  <version>2.9.0</version>
</dependency>
{% endhighlight %}

ITServiceTest.java
-------------

{% highlight java %}
{% endhighlight %}


完整代码
=============

请参照 GITHUB [ms-service](https://github.com/luoyan35714/TestInMicroServices/tree/master/ms-service)


參考資料
=============

集成测试 : [https://baike.baidu.com/item/%E9%9B%86%E6%88%90%E6%B5%8B%E8%AF%95/1924552](https://baike.baidu.com/item/%E9%9B%86%E6%88%90%E6%B5%8B%E8%AF%95/1924552)

RestAssured ：[http://rest-assured.io/](http://rest-assured.io/)