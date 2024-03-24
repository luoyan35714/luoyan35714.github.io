---
layout: post
title:  Spring Boot(一) - 简单介绍
date:   2017-06-20 17:13:00 +0800
categories: 技术文档
tag: Spring-Boot
---

* content
{:toc}


> Spring Cloud崛起虽然比较晚，但是发展势头非常猛。仿佛一瞬间周围的人都在讨论微服务，讨论Spring Cloud。近来有时间来学习下相关的知识，而作为Spring Cloud下的基础Spring Boot就是第一个要掌握的技术点。

Spring Boot
==================

Spring Boot是由Pivotal团队提供的全新框架，其设计目的是用来简化新Spring应用的初始搭建以及开发过程。该框架使用了特定的方式来进行配置，从而使开发人员不再需要定义样板化的配置。通过这种方式，Spring Boot致力于在蓬勃发展的快速应用开发领域（rapid application development）成为领导者。[百度百科](http://baike.baidu.com/link?url=fZDXTGGGS1dN4S64qKwnPR1nqpxxTULzIkrQtM5U5i2Uit3wBPfhYkcGw8y70dWX-DQz2PUuF9unYg6LjY5smW0uBl39Ya8GYgmYxyIMggO)

官方文档中给出的目标是：

+ 为所有的Spring开发提供一个从根本上更快的和广泛使用的入门经验。
+ 开箱即用，但你可以通过不采用默认设置来摆脱这种方式。
+ 提供一系列大型项目常用的非功能性特征（比如，内嵌服务器，安全，指标，健康检测，外部化配置）。
+ 绝对不需要代码生成及XML配置。


系统要求
==================

第三方组件
------------------

| Java 				| 7 + 				|
| Spring Framework 	| 4.3.9.RELEASE + 	|
| Maven 			| 3.2 + 			|
| Gradle 			| 2.9 + 			|

Servlet containers
------------------

| Name 			| Servlet Version 	| Java Version 	|
| Tomcat 8 		| 3.1 				| Java 7+	 	|
| Tomcat 7 		| 3.0 				| Java 6+ 		|
| Jetty 9.3 	| 3.1 				| Java 8+ 		|
| Jetty 9.2 	| 3.1 				| Java 7+ 		|
| Jetty 8 		| 3.0 				| Java 6+ 		|
| Undertow 1.3 	| 3.1 				| Java 7+ 		|


参考资料
==================

Spring Boot : [百度百科](http://baike.baidu.com/link?url=fZDXTGGGS1dN4S64qKwnPR1nqpxxTULzIkrQtM5U5i2Uit3wBPfhYkcGw8y70dWX-DQz2PUuF9unYg6LjY5smW0uBl39Ya8GYgmYxyIMggO)

Spring Boot Reference Guide : [Spring Boot Reference Guide](http://docs.spring.io/spring-boot/docs/current-SNAPSHOT/reference/htmlsingle/)

《JavaEE开发的颠覆者 Spring Boot实战》 - 汪云飞