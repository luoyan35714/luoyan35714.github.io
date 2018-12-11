---
layout: post
title:  微服务架构下的测试之(五)-行为驱动开发(Behavior Driven Development)
date:   2018-12-11 21:30:00 +0800
categories: 技术文档
tag: 微服务
---

* content
{:toc}


行为驱动开发(Behavior Driven Development)
=============

行为驱动开发(Behavior Driven Development) ： 行为驱动开发是一种敏捷软件开发的技术，它鼓励软件项目中的开发者、QA和非技术人员或商业参与者之间的协作。

行为驱动开发有以下两个特点：

+ 用自然的语言去描述Feature和场景进行测试
+ 根据定义好的Feature驱动开发

在微服務的架構下，我們可以使用BDD来保证从根微服务开始，甚至是从UI页面开始，整个业务逻辑的调用都是正确的，前提是我们在践行BDD，即先写测试，然后开发，或者测试和开发同时由不同的人进行。

>> 更多的BDD信息可以参考[行为驱动开发（BDD）全面介绍](https://blog.csdn.net/winteroak/article/details/81585299)


测试方案
=============

举个例子，我们有三个微服务，一个是Gateway， 一个是ServiceA， 一个是ServiceB，它们的调用关系如下图。 现在三个微服务都已经上线了，我们要对整体的微服务进行测试，可以创建一个BDD项目，专门进行BDD测试。如果前面还有UI组件，我们也可以通过Selenium脚本在BDD项目中针对UI进行测试。

![](/images/blog/micro-service/08-bdd/01-bdd.png)

在java中针对BDD可以使用[Cucumber](https://cucumber.io/)来实现。


项目代码
=============

依旧拿之前的例子，有一个下单的流程，我们有4个微服务，分别是ms-gateway, ms-service, ms-product, ms-order. 其中

| ms-gateway | 负责gateway功能，所有微服务在一个子网，保证只有gateway可以与外网交互 |
| ms-service | 负责业务逻辑的处理 |
| ms-product | 负责产品信息的维护和库存的维护 |
| ms-order   | 负责订单信息的维护 |

具体的调用时序图如下：

![](/images/blog/micro-service/07-integration-test/02-order-project.png)

现在四个微服务都部署好之后，我们可以启动我们的BDD项目来对整个微服务调用链进行测试。


测试代码
=============

那么我们就可以使用[Cucumber](https://cucumber.io/)对整个微服务调用链进行测试，如下

pom.xml
-------------

{% highlight xml %}
<dependency>
	<groupId>info.cukes</groupId>
	<artifactId>cucumber-core</artifactId>
	<version>1.2.4</version>
	<scope>test</scope>
</dependency>
<dependency>
	<groupId>info.cukes</groupId>
	<artifactId>cucumber-java</artifactId>
	<version>1.2.4</version>
	<scope>test</scope>
</dependency>
<dependency>
	<groupId>info.cukes</groupId>
	<artifactId>cucumber-junit</artifactId>
	<version>1.2.4</version>
	<scope>test</scope>
</dependency>
<dependency>
	<groupId>info.cukes</groupId>
	<artifactId>cucumber-spring</artifactId>
	<version>1.2.4</version>
	<scope>test</scope>
</dependency>
{% endhighlight %}

CreateOrderTest.java
-------------

{% highlight java %}
{% endhighlight %}


完整代码
=============

请参照 GITHUB [ms-bdd](https://github.com/luoyan35714/TestInMicroServices/tree/master/ms-bdd)

參考資料
=============

BDD : [https://baike.baidu.com/item/BDD/10735732?fr=aladdin](https://baike.baidu.com/item/BDD/10735732?fr=aladdin)

[Cucumber](https://cucumber.io/)