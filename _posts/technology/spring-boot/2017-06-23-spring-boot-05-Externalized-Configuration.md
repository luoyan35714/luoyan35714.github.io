---
layout: post
title:  Spring Boot学习笔记(五) - 外化配置
date:   2017-06-23 16:56:00 +0800
categories: Spring Boot
tag: 教程
---

* content
{:toc}


外化配置
==================

定义
------------------

Spring Boot允许将配置外部化（externalize），这样你就能够在不同的环境下使用相同的代码。你可以使用properties文件，YAML文件，环境变量和命令行参数来外部化配置。使用@Value注解，可以直接将属性值注入到beans中，然后通过Spring的 Environment 抽象或通过 @ConfigurationProperties 绑定到结构化对象来访问。

PropertySource顺序
------------------

1. home目录下的devtools全局设置属性（ ~/.spring-bootdevtools.properties ，如果devtools激活）。
2. 测试用例上的@TestPropertySource注解。
3. 测试用例上的@SpringBootTest#properties注解。
4. 命令行参数
5. 来自 SPRING_APPLICATION_JSON 的属性（环境变量或系统属性中内嵌的内联JSON）。
6. ServletConfig 初始化参数。
7. ServletContext 初始化参数。
8. 来自于 java:comp/env 的JNDI属性。
9. Java系统属性（System.getProperties()）。
10. 操作系统环境变量。
11. RandomValuePropertySource，只包含 random.* 中的属性。
12. 没有打进jar包的Profile-specific应用属性（ application-{profile}.properties 和YAML变量）。
13. 打进jar包中的Profile-specific应用属性（ application-{profile}.properties 和YAML变量）。
14. 没有打进jar包的应用配置（ application.properties 和YAML变量）。
15. 打进jar包中的应用配置（ application.properties 和YAML变量）。
16. @Configuration 类上的 @PropertySource 注解。
17. 默认属性（使用 SpringApplication.setDefaultProperties 指定）。

配置随机数
------------------

在注入随机值（比如，密钥或测试用例）时 `RandomValuePropertySource` 很有用，它能产生整数，longs或字符串，比如：

{% highlight text %}
my.secret=${random.value}
my.number=${random.int}
my.bignumber=${random.long}
my.number.less.than.ten=${random.int(10)}
my.number.in.range=${random.int[1024,65536]}
{% endhighlight %}

`random.int*` 语法是 `OPEN value (,max) CLOSE` ，此处 `OPEN`，`CLOSE` 可以是任何字符，并且 `value，max` 是整数。如果提供 `max` ，那么 `value` 是最小值， `max` 是最大值（不包含在内）。

Application属性文件
------------------

SpringApplication 将从以下位置加载 application.properties 文件，并把它们添加到Spring Environment 中：

1. 当前目录下的 /config 子目录。
2. 当前目录。
3. classpath下的 /config 包。
4. classpath根路径（root）。

> 该列表是按优先级排序的（列表中位置高的路径下定义的属性将覆盖位置低的）

属性占位符
------------------

当使用 application.properties 定义的属性时，Spring会先通过已经存在的 Environment 查找该属性，所以可以引用事先定义的值（比如，系统属性）：

{% highlight text %}
app.name=MyApp
app.description=${app.name} is a Spring Boot application
{% endhighlight %}

使用YAML代替Properties
------------------

可以使用YAML（'.yml'）文件替代'.properties'文件。

如下两个配置是等价的：

![/images/blog/spring-boot/05-externalized-configuration/01-application-properties.png](/images/blog/spring-boot/05-externalized-configuration/01-application-properties.png)

![/images/blog/spring-boot/05-externalized-configuration/02-application-yml.png](/images/blog/spring-boot/05-externalized-configuration/02-application-yml.png)


实验
==================

创建一个Maven项目
------------------

![/images/blog/spring-boot/05-externalized-configuration/03-new-maven-project.png](/images/blog/spring-boot/05-externalized-configuration/03-new-maven-project.png)

pom.xml
------------------

{% highlight xml %}
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
	<modelVersion>4.0.0</modelVersion>

	<groupId>com.freud.test</groupId>
	<artifactId>spring-boot-05</artifactId>
	<version>0.0.1-SNAPSHOT</version>
	<packaging>jar</packaging>

	<name>spring-boot-05</name>
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

ConfigurationValues.java
------------------

{% highlight java %}
package com.freud.test.springboot;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * @author Freud
 */
@Component
@ConfigurationProperties(prefix = "configuration")
public class ConfigurationValues {

	private String name;
	private int age;

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public int getAge() {
		return age;
	}

	public void setAge(int age) {
		this.age = age;
	}

}
{% endhighlight %}

RandomValues.java
------------------

{% highlight java %}
package com.freud.test.springboot;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * @author Freud
 */
@Component
@ConfigurationProperties(prefix = "my")
public class RandomValues {

	private String secret;
	private String number;
	private String bigNumber;
	private String numberLessThanTen;
	private String numberInRange;

	public String getSecret() {
		return secret;
	}

	public void setSecret(String secret) {
		this.secret = secret;
	}

	public String getNumber() {
		return number;
	}

	public void setNumber(String number) {
		this.number = number;
	}

	public String getBigNumber() {
		return bigNumber;
	}

	public void setBigNumber(String bigNumber) {
		this.bigNumber = bigNumber;
	}

	public String getNumberLessThanTen() {
		return numberLessThanTen;
	}

	public void setNumberLessThanTen(String numberLessThanTen) {
		this.numberLessThanTen = numberLessThanTen;
	}

	public String getNumberInRange() {
		return numberInRange;
	}

	public void setNumberInRange(String numberInRange) {
		this.numberInRange = numberInRange;
	}

}
{% endhighlight %}

App.java
------------------

{% highlight java %}
package com.freud.test.springboot;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * @author Freud
 */
@SpringBootApplication
// 可以添加注解，制定配置变量加载的路径
// @PropertySource(value = { "classpath:application.yml" }, encoding = "utf-8")
@RestController
public class App {

	@Value("${internal.name}")
	private String name;

	@Value("${internal.age}")
	private Integer age;

	@Autowired
	private ConfigurationValues configurationValues;

	@Autowired
	private RandomValues randomValues;

	@GetMapping("/internal")
	public String internal() {
		return "Name : " + this.name + ", Age : " + this.age;
	}

	@GetMapping("/config")
	public ConfigurationValues configurationValue() {
		return configurationValues;
	}

	@GetMapping("/random")
	public RandomValues randomValue() {
		return randomValues;
	}

	public static void main(String[] args) {
		SpringApplication.run(App.class, args);
	}

}
{% endhighlight %}

application.yml
------------------

{% highlight yml %}
spring:
  application:
    name: test-05
server:
  port: 9091

name: Freud, Kang

configuration:
  name: ${name} (configuration)
  age: 29

internal:
  name: ${name} (Internal)
  age: 30
  
# 随机数不可以以radom开头，否则将产生都是随机字符串。
my: 
  secret: ${random.value}
  number: ${random.int}
  bigNumber: ${random.long}
  numberLessThanTen: ${random.int(10)}
  numberInRange: ${random.int[1024,65536]}
{% endhighlight %}

项目结构
------------------

![/images/blog/spring-boot/05-externalized-configuration/04-project-hierarchy.png](/images/blog/spring-boot/05-externalized-configuration/04-project-hierarchy.png)

启动项目
------------------

`App`类通过`main`函数的方式启动。

运行结果
------------------

![/images/blog/spring-boot/05-externalized-configuration/05-explorer-internal.png](/images/blog/spring-boot/05-externalized-configuration/05-explorer-internal.png)

![/images/blog/spring-boot/05-externalized-configuration/06-explorer-config.png](/images/blog/spring-boot/05-externalized-configuration/06-explorer-config.png)

![/images/blog/spring-boot/05-externalized-configuration/07-explorer-random.png](/images/blog/spring-boot/05-externalized-configuration/07-explorer-random.png)


参考资料
==================

Spring Boot Reference Guide : [Spring Boot Reference Guide](http://docs.spring.io/spring-boot/docs/current-SNAPSHOT/reference/htmlsingle/)
