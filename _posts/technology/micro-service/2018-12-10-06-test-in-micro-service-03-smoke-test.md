---
layout: post
title:  微服务架构下的测试之(三)-冒烟測試(Smote Test)
date:   2018-12-10 09:58:00 +0800
categories: 技术文档
tag: 微服务
---

* content
{:toc}


冒烟測試（Smoke Test）
=============

冒烟測試（Smoke Test） ： 这一术语源自硬件行业。对一个硬件或硬件组件进行更改或修复后，直接给设备加电。如果没有冒烟，则该组件就通过了测试。在软件中，冒烟测试设计用于确认代码中的更改会按预期运行，且不会破坏整个版本的稳定性。

在微服務的架構下，我們可以使用冒烟測試來保證单个微服务在不依赖其他服务（其他服务在此处包含其他微服务或者其他的中间件）的前提下，其本身是正常运行的。


测试方案
=============

举个例子，我们有三个微服务，一个是Gateway， 一个是ServiceA， 一个是ServiceB，它们的调用关系如下图。 现在要上线的是ServiceA，我们需要保证的是在不依赖ServiceB的情况下，ServiceA可以正常启动，部署和运行。

![](/images/blog/micro-service/06-smoke-test/01-Smoke-Test.png)

针对冒烟测试可以搭配使用[MockMvc](https://docs.spring.io/spring/docs/current/spring-framework-reference/testing.html)和[WireMock](http://wiremock.org/)来实现。


项目代码
=============

举个例子，有一个下单的流程，我们有4个微服务，分别是ms-gateway, ms-service, ms-product, ms-order. 其中

| ms-gateway | 负责gateway功能，所有微服务在一个子网，保证只有gateway可以与外网交互 |
| ms-service | 负责业务逻辑的处理 |
| ms-product | 负责产品信息的维护和库存的维护 |
| ms-order   | 负责订单信息的维护 |

具体的调用时序图如下：

![](/images/blog/micro-service/06-smoke-test/02-order-project.png)

现在我们要部署ms-service项目，并且相对其进行冒烟测试。

项目controller层代码如下：

{% highlight java %}
{% endhighlight %}

项目service层代码如下：

{% highlight java %}
{% endhighlight %}


测试代码
=============

那么我们就可以使用 [MockMVC](https://docs.spring.io/spring/docs/current/spring-framework-reference/testing.html)和[WireMock](http://wiremock.org/) 对这个项目进行测试，如下

pom.xml
-------------

{% highlight xml %}
<dependency>
	<groupId>org.springframework.boot</groupId>
	<artifactId>spring-boot-starter-test</artifactId>
	<scope>test</scope>
</dependency>
<dependency>
	<groupId>com.github.tomakehurst</groupId>
	<artifactId>wiremock</artifactId>
	<version>2.1.12</version>
	<scope>test</scope>
</dependency>
{% endhighlight %}

ProductControllerSmokeTest.java
-------------

{% highlight java %}
{% endhighlight %}


完整代码
=============

请参照 GITHUB [ms-service](https://github.com/luoyan35714/TestInMicroServices/tree/master/ms-service)


參考資料
=============

冒烟测试 : [https://baike.baidu.com/item/%E5%86%92%E7%83%9F%E6%B5%8B%E8%AF%95/2166486?fr=aladdin](https://baike.baidu.com/item/%E5%86%92%E7%83%9F%E6%B5%8B%E8%AF%95/2166486?fr=aladdin)

MockMvc : [https://docs.spring.io/spring/docs/current/spring-framework-reference/testing.html](https://docs.spring.io/spring/docs/current/spring-framework-reference/testing.html)

WireMock : [http://wiremock.org/](http://wiremock.org/)