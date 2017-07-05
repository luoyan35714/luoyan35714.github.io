---
layout: post
title:  Spring Boot学习笔记(十四) - 缓存
date:   2017-07-05 13:44:00 +0800
categories: Spring Boot
tag: 教程
---

* content
{:toc}


Spring缓存
==================

定义
------------------

Spring定义了org.springframework.cache.CacheManager和org.springframework.cache.Cache接口用来统一不同的缓存的技术。其中CacheManager是Spring提供的各种缓存技术抽象接口，Cache接口包含缓存的各种操作(增加，删除，获得缓存)。

Spring框架提供为应用透明添加缓存的支持，核心思想是，将缓存抽象出来应用在方法上，如果缓存中有数据，就不会执行方法。缓存逻辑的应用是透明的，不会干扰调用者。

简而言之，为服务的某个操作添加缓存跟为方法添加相应注解那样简单：

{% highlight java %}
import javax.cache.annotation.CacheResult;
import org.springframework.stereotype.Component;
@Component
public class MathService {
	@CacheResult
	public int computePiDecimal(int i) {
		// ...
	}
}
{% endhighlight %}

注解
------------------

| @Cacheable 	| 触发缓存发布，方法执行前会先检查缓存中有没有数据，如果有就直接返回，没有就执行方法，返回结果并将结果缓存起来。(triggers cache population) | 
| @CacheEvict 	| 触发缓存删除(triggers cache eviction) | 
| @CachePut 	| 执行方法并将返回结果更新缓存(updates the cache without interfering with the method execution) | 
| @Caching 		| 构建多个缓存操作应用在一个方法上(regroups multiple cache operations to be applied on a method) | 
| @CacheConfig 	| 共享一些类级别的缓存相关配置(shares some common cache-related settings at class-level) | 

更多介绍可以参照[36. Cache Abstraction](http://docs.spring.io/spring/docs/4.3.3.RELEASE/spring-framework-reference/htmlsingle/#cache).

Spring支持的CacheManager
------------------

| SimpleCacheManager 			| 使用简单的Collection来存储缓存，主要用来测试 						|
| ConcurrentMapCacheManager 	| 使用ConcurrentHashMap来存储缓存 									|
| NoOpCacheManager 				| 无缓存，仅测试用途 												|
| EhCacheCacheManager 			| 使用EhCache作为缓存技术 											|
| GuavaCacheManager 			| 使用Goole Guava的GuavaCache作为缓存技术 							|
| HazelcastCacheManager 		| 使用Hazelcast作为缓存技术 										|
| JCacheCacheManager 			| 支持JCache(JSR-107)标准的实现作为缓存技术，如Apache Commons JCS 	|
| RedisCacheManager 			| 使用Redis作为缓存技术 											|

声明式缓存
------------------

要开启声明式缓存只需要在类上添加@EnableCaching注解就可以了。

{% highlight java %}
@Configuration
@EnableCaching
public class AppConfig {
}
{% endhighlight %}


Spring Boot缓存
==================

在Spring中使用缓存技术的关键是配置CacheManager, 而Spring Boot为我们自动配置了多个CacheManager的实现。但必须使用 `@EnableCaching` 注解开启缓存支持, Spring Boot 会根据实现自动配置一个合适的CacheManager。

SpringBoot将按照如下顺序尝试以下提供商CacheManager：

CachaManager提供商
------------------

+ [Generic](http://docs.spring.io/spring-boot/docs/1.5.4.RELEASE/reference/htmlsingle/#boot-features-caching-provider-generic)
+ [JCache (JSR-107)(EhCache 3, Hazelcast, Infinispan, etc)](http://docs.spring.io/spring-boot/docs/1.5.4.RELEASE/reference/htmlsingle/#boot-features-caching-provider-jcache)
+ [EhCache 2.x](http://docs.spring.io/spring-boot/docs/1.5.4.RELEASE/reference/htmlsingle/#boot-features-caching-provider-ehcache2)
+ [Hazelcast](http://docs.spring.io/spring-boot/docs/1.5.4.RELEASE/reference/htmlsingle/#boot-features-caching-provider-hazelcast)
+ [Infinispan](http://docs.spring.io/spring-boot/docs/1.5.4.RELEASE/reference/htmlsingle/#boot-features-caching-provider-infinispan)
+ [Couchbase](http://docs.spring.io/spring-boot/docs/1.5.4.RELEASE/reference/htmlsingle/#boot-features-caching-provider-couchbase)
+ [Redis](http://docs.spring.io/spring-boot/docs/1.5.4.RELEASE/reference/htmlsingle/#boot-features-caching-provider-redis)
+ [Caffeine](http://docs.spring.io/spring-boot/docs/1.5.4.RELEASE/reference/htmlsingle/#boot-features-caching-provider-caffeine)
+ [Guava (deprecated)](http://docs.spring.io/spring-boot/docs/1.5.4.RELEASE/reference/htmlsingle/#boot-features-caching-provider-guava)
+ [Simple](http://docs.spring.io/spring-boot/docs/1.5.4.RELEASE/reference/htmlsingle/#boot-features-caching-provider-simple)

CachaManager自动配置
------------------

对于代码实现，SpringBoot的CacheManager的自动配置放置在`spring-boot-autoconfigure-*.RELEASE.jar`文件中的`org.springframework.boot.autoconfigure.cache`包下

![/images/blog/spring-boot/14-cache/01-cache-manager-list.png](/images/blog/spring-boot/14-cache/01-cache-manager-list.png)

CachaManager使用方式
------------------

{% highlight text %}
# 可选值generic, jcache, ehcache, hazelcast, infinispan, couchbase, redis, caffeine, guava, simple, none
spring.cache.type=generic
spring.cache.cache-names= # 程序启动时创建缓存名
spring.cache.jcache.config= # jcache 配置文件地址
spring.cache.jcache.provider= # 当多个jcache是现在类路径中的时候，指定jcache实现
spring.cache.ehcache.config= # ehcache配置文件地址
spring.hazelcast.config= # hazelcast配置文件地址
spring.cache.infinispan.config= # infinispan配置文件地址
spring.couchbase.bucket.name= # couchbase name
spring.couchbase.bucket.password= # couchbase password
spring.redis.url= # redis连接URL
spring.cache.caffeine.spec= # caffeine spec
spring.cache.guava.spec= # guava spec，已经废弃
{% endhighlight %}


实验
==================

> 本实验基于EhCache进行。

创建一个Maven项目
------------------

![/images/blog/spring-boot/14-cache/02-new-maven-project.png](/images/blog/spring-boot/14-cache/02-new-maven-project.png)

pom.xml
------------------

{% highlight xml %}
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
	<modelVersion>4.0.0</modelVersion>

	<groupId>com.freud.test</groupId>
	<artifactId>spring-boot-14</artifactId>
	<version>0.0.1-SNAPSHOT</version>
	<packaging>jar</packaging>

	<name>spring-boot-14</name>
	<url>http://maven.apache.org</url>

	<properties>
		<project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
	</properties>

	<dependencies>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-web</artifactId>
		</dependency>
		<dependency>
			<groupId>net.sf.ehcache</groupId>
			<artifactId>ehcache</artifactId>
		</dependency>
		<dependency>
			<groupId>org.springframework</groupId>
			<artifactId>spring-context-support</artifactId>
		</dependency>
	</dependencies>

	<build>
		<plugins>
			<plugin>
				<groupId>org.springframework.boot</groupId>
				<artifactId>spring-boot-maven-plugin</artifactId>
			</plugin>
		</plugins>
	</build>

	<dependencyManagement>
		<dependencies>
			<dependency>
				<groupId>org.springframework.boot</groupId>
				<artifactId>spring-boot-dependencies</artifactId>
				<version>1.5.4.RELEASE</version>
				<type>pom</type>
				<scope>import</scope>
			</dependency>
		</dependencies>
	</dependencyManagement>
</project>
{% endhighlight %}

application.yml
------------------

{% highlight yml %}
spring:
  application:
    name: test-14
  cache:
    cache-names:
    - test-14-caches
    type: ehcache
    ehcache:
      config: classpath:my-ehcache.xml
server:
  port: 9090
{% endhighlight %}

my-ehcache.xml
------------------

{% highlight xml %}
<?xml version="1.0" encoding="UTF-8"?>
<ehcache xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xsi:noNamespaceSchemaLocation="http://ehcache.org/ehcache.xsd"
	updateCheck="false" >

	<diskStore path="java.io.tmpdir/tmp_ehcache" />

	<!-- 默认缓存策略，当ehcache找不到定义的缓存时，则使用这个缓存策略。只能定义一个。 -->
	<defaultCache 
		maxElementsInMemory="100000"
		eternal="true"
		overflowToDisk="true" 
		maxElementsOnDisk="1000000" 
		diskPersistent="false"
		diskExpiryThreadIntervalSeconds="120" 
		diskSpoolBufferSizeMB="100" 
		>
	</defaultCache>
	
	<!-- 通过@Cacheable使用缓存，默认缓存最后一次访问30分钟. -->
	<cache name="TestEhCache" 
		maxElementsInMemory="100000" 
		eternal="false"
		timeToIdleSeconds="1800" 
		overflowToDisk="true" 
		maxElementsOnDisk="1000000" 
		diskPersistent="false" 
		memoryStoreEvictionPolicy="LRU" >
	</cache>

</ehcache>
{% endhighlight %}

Person.java
------------------

{% highlight java %}
package com.freud.test.springboot;

import java.io.Serializable;

/**
 * @author Freud
 */
public class Person implements Serializable {

	private static final long serialVersionUID = 1L;

	private Integer id;
	private String name;

	public Integer getId() {
		return id;
	}

	public void setId(Integer id) {
		this.id = id;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

}
{% endhighlight %}

App.java
------------------

{% highlight java %}
package com.freud.test.springboot;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * @author Freud
 */
@SpringBootApplication
@RestController
@EnableCaching
public class App {

	@CachePut(cacheNames = "TestEhCache", key = "#person.id")
	@GetMapping("/put")
	public Person cachePut(Person person) {
		return person;
	}

	@Cacheable(cacheNames = "TestEhCache", key = "#person.id")
	@GetMapping("/get")
	public Person cacheableRandom(Person person) {
		return null;
	}

	@CacheEvict(cacheNames = "TestEhCache")
	@GetMapping("/evict")
	public String cacheEvict(@RequestParam("id") int id) {
		return "success";
	}

	public static void main(String[] args) {
		SpringApplication.run(App.class, args);
	}

}
{% endhighlight %}

项目结构
------------------

![/images/blog/spring-boot/14-cache/03-project-hierarchy.png](/images/blog/spring-boot/14-cache/03-project-hierarchy.png)


运行结果
==================

查看缓存情况
------------------

`http://localhost:9090/get?id=1`

![/images/blog/spring-boot/14-cache/04-check-cache-content.png](/images/blog/spring-boot/14-cache/04-check-cache-content.png)

设置缓存
------------------

`http://localhost:9090/put?id=1&name=freud`

![/images/blog/spring-boot/14-cache/05-set-cache-content.png](/images/blog/spring-boot/14-cache/05-set-cache-content.png)

重新查看缓存情况
------------------

`http://localhost:9090/get?id=1`

![/images/blog/spring-boot/14-cache/06-check-cache-content.png](/images/blog/spring-boot/14-cache/06-check-cache-content.png)

清除缓存
------------------

`http://localhost:9090/evict?id=1`

![/images/blog/spring-boot/14-cache/07-clear-cache-content.png](/images/blog/spring-boot/14-cache/07-clear-cache-content.png)

重新查看缓存情况
------------------

`http://localhost:9090/get?id=1`

![/images/blog/spring-boot/14-cache/08-check-cache-content.png](/images/blog/spring-boot/14-cache/08-check-cache-content.png)


参考资料
==================

Spring Boot Reference Guide : [http://docs.spring.io/spring-boot/docs/current-SNAPSHOT/reference/htmlsingle/](http://docs.spring.io/spring-boot/docs/current-SNAPSHOT/reference/htmlsingle/)

36. Cache Abstraction : [http://docs.spring.io/spring/docs/4.3.3.RELEASE/spring-framework-reference/htmlsingle/#cache](http://docs.spring.io/spring/docs/4.3.3.RELEASE/spring-framework-reference/htmlsingle/#cache)

[http://docs.spring.io/spring/docs/4.3.3.RELEASE/spring-framework-reference/htmlsingle/#expressions](http://docs.spring.io/spring/docs/4.3.3.RELEASE/spring-framework-reference/htmlsingle/#expressions)

《JavaEE开发的颠覆者 Spring Boot实战》 - 汪云飞