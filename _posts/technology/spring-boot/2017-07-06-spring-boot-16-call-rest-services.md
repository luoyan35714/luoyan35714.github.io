---
layout: post
title:  Spring Boot学习笔记(十六) - 调用REST服务
date:   2017-07-06 14:12:00 +0800
categories: Spring-Boot
tag: 教程
---

* content
{:toc}


调用REST服务
==================

如果应用需要调用远程REST服务，可以使用Spring框架的 `RestTemplate` 类。由于 `RestTemplate` 实例经常在使用前需要自定义，Spring Boot就没有提供任何自动配置的 `RestTemplate` bean，不过可以通过自动配置的 `RestTemplateBuilder` 创建自己需要的 `RestTemplate` 实例。自动配置的 `RestTemplateBuilder` 会确保应用到 RestTemplate 实例的 `HttpMessageConverters` 是合适的。

简单RestTemplate
------------------

{% highlight java %}
@Service
public class MyBean {
	
	@Autowired
	private  RestTemplate restTemplate;

	public Details someRestCall(String name) {
		return this.restTemplate.getForObject("/{name}/details", Details.class, name);
	}
}
{% endhighlight %}

> 注 `RestTemplateBuilder` 包含很多有用的方法，可以用于快速配置一个 `RestTemplate` 。例如，可以使用 `builder.basicAuthorization("user", "password").build()` 添加基本的认证支持 `BASIC auth` 。

自定义RestTemplate
------------------

当使用 `RestTemplateBuilder` 构建 `RestTemplate` 时，可以通过 `RestTemplateCustomizer` 进行更高级的定制，所有 `RestTemplateCustomizer` beans将自动添加到自动配置的 `RestTemplateBuilder` 。此外，调用 `additionalCustomizers(RestTemplateCustomizer…)` 方法可以创建一个新的，具有其他customizers的 `RestTemplateBuilder` 。

以下示例演示使用自定义器（customizer）配置所有hosts使用代理，除了 `192.168.0.5` ：

{% highlight java %}
static class ProxyCustomizer implements RestTemplateCustomizer {
	@Override
	public void customize(RestTemplate restTemplate) {
		HttpHost proxy = new HttpHost("proxy.example.com");
		HttpClient httpClient = HttpClientBuilder.create().setRoutePlanner(new DefaultProxyRoutePlanner(proxy) {

			@Override
			public HttpHost determineProxy(HttpHost target, HttpRequest request, HttpContext context)
					throws HttpException {
				if (target.getHostName().equals("192.168.0.5")) {
					return null;
				}
				return super.determineProxy(target, request, context);
			}
		}).build();
		restTemplate.setRequestFactory(new HttpComponentsClientHttpRequestFactory(httpClient));
	}
}
{% endhighlight %}


实验
==================

> 正常演示REST会使用两个REST服务来演示，不过为了篇幅本次实验只启动了一个REST服务，自己调用自己，不过不是JVM内部调用，还是走的REST。

创建一个Maven项目
------------------

![/images/blog/spring-boot/16-call-rest-services/01-new-maven-project.png](/images/blog/spring-boot/16-call-rest-services/01-new-maven-project.png)

pom.xml
------------------

{% highlight xml %}
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
	<modelVersion>4.0.0</modelVersion>

	<groupId>com.freud.test</groupId>
	<artifactId>spring-boot-16</artifactId>
	<version>0.0.1-SNAPSHOT</version>
	<packaging>jar</packaging>

	<name>spring-boot-16</name>
	<url>http://maven.apache.org</url>

	<properties>
		<project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
	</properties>

	<dependencies>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-web</artifactId>
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
    name: test-16
server:
  port: 9090
{% endhighlight %}

App.java
------------------

{% highlight java %}
package com.freud.test.springboot;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

/**
 * @author Freud
 */
@SpringBootApplication
@RestController
public class App {

	@Autowired
	private RestTemplate restTemplate;

	@GetMapping("/index")
	public String index() {
		return this.restTemplate.getForObject("http://localhost:9090/data", String.class);
	}

	@GetMapping("/data")
	public String data() {
		return "www.hifreud.com";
	}

	public static void main(String[] args) {
		SpringApplication.run(App.class, args);
	}

}
{% endhighlight %}

项目结构
------------------

![/images/blog/spring-boot/16-call-rest-services/02-project-hierarchy.png](/images/blog/spring-boot/16-call-rest-services/02-project-hierarchy.png)


运行结果
==================

访问如下URL - `http://localhost:9090/index`

![/images/blog/spring-boot/16-call-rest-services/03-explorer-run-result.png](/images/blog/spring-boot/16-call-rest-services/03-explorer-run-result.png)


参考资料
==================

Spring Boot Reference Guide : [http://docs.spring.io/spring-boot/docs/current-SNAPSHOT/reference/htmlsingle/](http://docs.spring.io/spring-boot/docs/current-SNAPSHOT/reference/htmlsingle/)
