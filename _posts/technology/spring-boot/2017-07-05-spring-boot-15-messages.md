---
layout: post
title:  Spring Boot(十五) - 消息
date:   2017-07-05 14:10:00 +0800
categories: 技术文档
tag: Spring-Boot
---

* content
{:toc}


JMS(Java Message Service)即Java消息服务，是基于JVM消息代理的规范，而ActiveMQ，Artemis是一个JMS消息代理的实现。

AMQP(Advanced Message Queuing Protocol)也是一个消息代理的规范，但它不仅兼容JMS，还支持跨语言和平台。AMQP的主要实现有RabbitMQ。

Spring Framework框架为集成消息系统提供了扩展（extensive）支持：从使用 JmsTemplate 简化JMS API，到实现一个能够异步接收消息的完整的底层设施。Spring AMQP提供一个相似的用于'高级消息队列协议'的特征集，并且Spring Boot也为 RabbitTemplate 和RabbitMQ提供了自动配置选项。Spring Websocket提供原生的STOMP消息支持，并且Spring Boot也提供了starters和自动配置支持。

JMS
==================

javax.jms.ConnectionFactory 接口提供标准的用于创建 javax.jms.Connection 的方法， javax.jms.Connection 用于和JMS代理（broker）交互。 尽管Spring需要一个 ConnectionFactory 才能使用JMS，通常你不需要直接使用它，而是依赖于上层消息抽象, ([具体参考Spring框架的相关章节](http://docs.spring.io/spring/docs/4.1.4.RELEASE/spring-framework-reference/htmlsingle/#jms)），Spring Boot会自动配置发送和接收消息需要的设施（infrastructure）

ActiveMQ
------------------

如果发现ActiveMQ在classpath下可用，Spring Boot会配置一个 ConnectionFactory 。如果需要代理，将会开启一个内嵌的，已经自动配置好的代理（只要配置中没有指定代理URL）。通常的外置ActiveMQ的配置会是如下配置，更多配置参考[ActiveMQProperties](https://github.com/spring-projects/spring-boot/blob/master/spring-boot-autoconfigure/src/main/java/org/springframework/boot/autoconfigure/jms/activemq/ActiveMQProperties.java)

{% highlight text %}
spring.activemq.broker-url= tcp://127.0.0.1:61616
spring.activemq.user= admin
spring.activemq.password= admin
{% endhighlight %}

Artemis
------------------

如果发现classpath下存在Artemis依赖，Spring Boot将自动配置一个 ConnectionFactory 。如果需要broker，Spring Boot将启动内嵌的broker，并对其自动配置（除非模式mode属性被显式设置）。支持的modes包括： embedded （明确需要内嵌broker，如果classpath下不存在则出错）， native （使用 netty 传输协议连接broker）。当配置 native 模式，Spring Boot将配置一个连接broker的 ConnectionFactory ，该broker使用默认的设置运行在本地机器。 注 使用 spring-boot-starter-artemis 'Starter'，则连接已存在的Artemis实例及Spring设施集成JMS所需依赖都会提供，添加 org.apache.activemq:artemis-jms-server 依赖，你可以使用内嵌模式。

{% highlight text %}
spring.artemis.mode=native
spring.artemis.host=127.0.0.1
spring.artemis.port=9876
spring.artemis.user=admin
spring.artemis.password=secret
{% endhighlight %}

当使用内嵌模式时，你可以选择是否启用持久化，及目的地列表。这些可以通过逗号分割的列表来指定，也可以分别定义 `org.apache.activemq.artemis.jms.server.config.JMSQueueConfiguration` 或 `org.apache.activemq.artemis.jms.server.config.TopicConfiguration` 类型的bean来进一步配置队列和topic，具体支持选项可参考[ArtemisProperties](https://github.com/spring-projects/spring-boot/blob/v1.5.4.RELEASE/spring-boot-autoconfigure/src/main/java/org/springframework/boot/autoconfigure/jms/artemis/ArtemisProperties.java)。

JNDI ConnectionFactory
------------------

如果你的App运行在应用服务器中，Spring Boot将尝试使用JNDI定位一个JMS ConnectionFactory ，默认会检查 `java:/JmsXA` 和 `java:/XAConnectionFactory` 两个地址。如果需要指定替换位置，可以使用 `spring.jms.jndi-name` 属性：

{% highlight text %}
spring.jms.jndi-name=java:/MyConnectionFactory
{% endhighlight %}

发送消息
------------------

Spring的 JmsTemplate 会被自动配置，你可以将它直接注入到自己的beans中：

> 注 你可以使用相同方式注入`JmsMessagingTemplate`。如果定义了 `DestinationResolver` 或 `MessageConverter` beans，它们将自动关联到自动配置的 `JmsTemplate` 。

{% highlight java %}
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jms.core.JmsTemplate;
import org.springframework.stereotype.Component;

@Component
public class MyBean {

	private final JmsTemplate jmsTemplate;
	
	@Autowired
	public MyBean(JmsTemplate jmsTemplate) {
		this.jmsTemplate = jmsTemplate;
	}
	// ...
}
{% endhighlight %}

接收消息
------------------

当JMS基础设施能够使用时，任何bean都能够被 `@JmsListener` 注解，以创建一个监听者端点。如果没有定义 `JmsListenerContainerFactory` ，将自动配置一个默认的。如果定义 `DestinationResolver` 或 `MessageConverter` beans，它们将自动关联该默认factory。

默认factory是事务性的，如果运行的设施出现 `JtaTransactionManager` ，它默认将关联到监听器容器。如果没有， `sessionTransacted` 标记将启用。在后一场景中，你可以通过在监听器方法上添加 `@Transactional` ，以本地数据存储事务处理接收的消息，这可以确保接收的消息在本地事务完成后只确认一次。

详细信息参考[EnableJms](http://docs.spring.io/spring/docs/4.3.3.RELEASE/javadoc-api/org/springframework/jms/annotation/EnableJms.html)

{% highlight java %}
@Component
public class MyBean {
	@JmsListener(destination = "someQueue")
	public void processMessage(String content) {
		// ...
	}
}
{% endhighlight %}

如果想创建多个 `JmsListenerContainerFactory` 实例或覆盖默认实例，你可以使用Spring Boot提供的 `DefaultJmsListenerContainerFactoryConfigurer` ，通过它可以使用跟自动配置的实例相同配置来初始化一个 `DefaultJmsListenerContainerFactory` 。

例如，以下使用一个特殊的 MessageConverter 创建另一个factory：

{% highlight java %}
@Configuration
static class JmsConfiguration {
	@Bean
	public DefaultJmsListenerContainerFactory myFactory(DefaultJmsListenerContainerFactoryConfigurer configurer) {
		DefaultJmsListenerContainerFactory factory = new DefaultJmsListenerContainerFactory();
		configurer.configure(factory, connectionFactory());
		factory.setMessageConverter(myMessageConverter());
		return factory;
	}

	public ConnectionFactory connectionFactory() {
		ActiveMQConnectionFactory connectionFactory = new ActiveMQConnectionFactory();
		connectionFactory.setBrokerURL("tcp://127.0.0.1:61616");
		connectionFactory.setUserName("admin");
		connectionFactory.setPassword("admin");
		return connectionFactory;
	}

	private MessageConverter myMessageConverter() {
		// 自己实现，此处使用Simple来实现的。
		return new SimpleMessageConverter();
	}
}
{% endhighlight %}

然后，就可以像下面那样在任何 @JmsListener 注解中使用：

{% highlight java %}
@Component
public class MyBean {
	@JmsListener(destination = "someQueue", containerFactory="myFactory")
	public void processMessage(String content) {
		// ...
	}
}
{% endhighlight %}


AMQP
==================

高级消息队列协议（AMQP）是一个用于消息中间件的，平台无关的，线路级（wire-level）协议。Spring AMQP项目使用Spring的核心概念开发基于AMQP的消息解决方案，Spring Boot为通过RabbitMQ使用AMQP提供了一些便利，包括 spring-boot-starter-amqp ‘Starter’。

RabbitMQ
------------------

RabbitMQ是一个基于AMQP协议，轻量级的，可靠的，可扩展的和可移植的消息代理，Spring就使用它进行消息传递。RabbitMQ配置被外部属性 `spring.rabbitmq.*` 控制，例如，在 `application.properties` 中声明以下片段, 更多配置参见[RabbitProperties](https://github.com/spring-projects/spring-boot/blob/v1.5.4.RELEASE/spring-boot-autoconfigure/src/main/java/org/springframework/boot/autoconfigure/amqp/RabbitProperties.java)：

{% highlight text %}
spring.rabbitmq.host=127.0.0.1
spring.rabbitmq.port=5672
spring.rabbitmq.username=admin
spring.rabbitmq.password=secret
{% endhighlight %}

发送消息
------------------

Spring的 AmqpTemplate 和 AmqpAdmin 会被自动配置，你可以将它们直接注入beans中：

{% highlight java %}
import org.springframework.amqp.core.AmqpAdmin;
import org.springframework.amqp.core.AmqpTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class MyBean {
	
	private final AmqpAdmin amqpAdmin;
	private final AmqpTemplate amqpTemplate;
	
	@Autowired
	public MyBean(AmqpAdmin amqpAdmin, AmqpTemplate amqpTemplate){
		this.amqpAdmin = amqpAdmin;
		this.amqpTemplate = amqpTemplate;
	}
	// ...
}
{% endhighlight %}

> 注 可以使用相似方式注入 `RabbitMessagingTemplate` ，如果定义 `MessageConverter` bean，它将自动关联到自动配置的 AmqpTemplate 。

如果需要的话，所有定义为bean的 `org.springframework.amqp.core.Queue` 将自动在RabbitMQ实例中声明相应的队列。可以启用 `AmqpTemplate` 的重试选项，例如代理连接丢失时，`重试默认不启用`。

接收消息
------------------

当Rabbit设施出现时，所有bean都可以注解 `@RabbitListener` 来创建一个监听器端点。如果没有定义 `RabbitListenerContainerFactory` ，Spring Boot将自动配置一个默认的。如果定义 `MessageConverter` beans，它将自动关联到默认的factory。

更多细节参考[@EnableRabbit](http://docs.spring.io/spring-amqp/docs/current/api/org/springframework/amqp/rabbit/annotation/EnableRabbit.html)。

{% highlight java %}
@Component
public class MyBean {
	@RabbitListener(queues = "someQueue")
	public void processMessage(String content) {
		// ...
	}
}
{% endhighlight %}

如果需要创建多个 `RabbitListenerContainerFactory` 实例，或想覆盖默认实例，你可以使用Spring Boot提供的 `SimpleRabbitListenerContainerFactoryConfigurer` ，通过它可以使用跟自动配置实例相同的配置初始化 `SimpleRabbitListenerContainerFactory` 。

例如，下面使用一个特殊的 `MessageConverter` 创建了另一个factory：

{% highlight java %}
@Configuration
static class RabbitConfiguration {
	@Bean
	public SimpleRabbitListenerContainerFactory myFactory(SimpleRabbitListenerContainerFactoryConfigurer configurer) {
		SimpleRabbitListenerContainerFactory factory = new SimpleRabbitListenerContainerFactory();
		configurer.configure(factory, connectionFactory);
		factory.setMessageConverter(myMessageConverter());
		return factory;
	}
}
{% endhighlight %}

然后，就可以像下面那样在所有 @RabbitListener 注解方法中使用：

{% highlight java %}
@Component
public class MyBean {
	@RabbitListener(queues = "someQueue", containerFactory="myFactory")
	public void processMessage(String content) {
		// ...
	}
}
{% endhighlight %}

 > 可以启动重试处理那些监听器抛出异常的情况，当重试次数达到限制时，该消息将被拒绝，要不被丢弃，要不路由到一个dead-letter交换器，如果broker这样配置的话，默认禁用重试。

 > `重要`: 如果没启用重试，且监听器抛出异常，则Rabbit会不定期进行重试。可以采用两种方式修改该行为：设置 defaultRequeueRejected 属性为 false ，这样就不会重试；或抛出一个 AmqpRejectAndDontRequeueException 异常表示该消息应该被拒绝，这是开启重试，且达到最大重试次数时使用的策略。


Kafka
==================

使用介绍
------------------

`Apache Kafka` 可以通过在`spring-kafka`项目中自动配置来实现。

Kafka 是通过 `spring.kafka.*` 外部配置来控制的。详细配置参考[KafkaProperties](https://github.com/spring-projects/spring-boot/blob/v1.5.4.RELEASE/spring-boot-autoconfigure/src/main/java/org/springframework/boot/autoconfigure/kafka/KafkaProperties.java)

{% highlight text %}
spring.kafka.bootstrap-servers=localhost:9092
spring.kafka.consumer.group-id=myGroup
{% endhighlight %}

发送消息
------------------

Spring中 `KafkaTemplate` 会被自动配置，可以直接在bean中通过 `@autowire` 注入直接使用

{% highlight java %}
@Component
public class MyBean {
	private final KafkaTemplate kafkaTemplate;
	
	@Autowired
	public MyBean(KafkaTemplate kafkaTemplate) {
		this.kafkaTemplate = kafkaTemplate;
	}
	// ...
}
{% endhighlight %}

接收消息
------------------

当Apache Kafka基础设施能够使用时，任何bean都能够被 `@KafkaListener` 注解，以创建一个监听者端点。如果没有定义 `KafkaListenerContainerFactory` ，将自动配置一个以 `spring.kafka.listener.*` 为Key的默认的。

{% highlight java %}
@Component
public class MyBean {
	@KafkaListener(topics = "someTopic")
	public void processMessage(String content) {
		// ...
	}
}
{% endhighlight %}


实验
==================

> 本实验基于内置的ActiveMQ进行。

创建一个Maven项目
------------------

![/images/blog/spring-boot/15-messages/01-new-maven-project.png](/images/blog/spring-boot/15-messages/01-new-maven-project.png)

pom.xml
------------------

{% highlight xml %}
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
	<modelVersion>4.0.0</modelVersion>

	<groupId>com.freud.test</groupId>
	<artifactId>spring-boot-15</artifactId>
	<version>0.0.1-SNAPSHOT</version>
	<packaging>jar</packaging>

	<name>spring-boot-15</name>
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
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-activemq</artifactId>
		</dependency>
		<dependency>
			<groupId>org.springframework</groupId>
			<artifactId>spring-tx</artifactId>
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
    name: test-15
server:
  port: 9090
{% endhighlight %}

Constants.java
------------------

{% highlight java %}
package com.freud.test.springboot;

/**
 * @author Freud
 */
public final class Constants {

	public static final String TEST_QUEUE_NAME = "test_activemq_queue";
}
{% endhighlight %}

Producer.java
------------------

{% highlight java %}
package com.freud.test.springboot;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jms.core.JmsTemplate;
import org.springframework.stereotype.Component;

/**
 * @author Freud
 */
@Component
public class Producer {

	@Autowired
	private JmsTemplate jmsTemplate;

	public void send(String content) {
		jmsTemplate.convertAndSend(Constants.TEST_QUEUE_NAME, content + "-" + System.currentTimeMillis());
	}
}
{% endhighlight %}

Receiver.java
------------------

{% highlight java %}
package com.freud.test.springboot;

import java.text.MessageFormat;
import java.util.Date;

import org.springframework.jms.annotation.JmsListener;
import org.springframework.stereotype.Component;

/**
 * @author Freud
 */
@Component
public class Receiver {

	@JmsListener(destination = Constants.TEST_QUEUE_NAME)
	public void processMessage(String content) {
		System.out.println(MessageFormat.format("[{0}] Receive data [{1}] from queue [{1}]. ", new Date(), content,
				Constants.TEST_QUEUE_NAME));
	}
}
{% endhighlight %}

App.java
------------------

{% highlight java %}
package com.freud.test.springboot;

import java.text.MessageFormat;
import java.util.Date;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * @author Freud
 */
@SpringBootApplication
@RestController
public class App {

	@Autowired
	private Producer producer;

	@GetMapping("/send")
	public String send(@RequestParam("content") String content) {
		producer.send(content);
		return MessageFormat.format("sent data : [{0}] at [{1}].", content, new Date());
	}

	public static void main(String[] args) {
		SpringApplication.run(App.class, args);
	}

}
{% endhighlight %}

项目结构
------------------

![/images/blog/spring-boot/15-messages/02-project-hierarchy.png](/images/blog/spring-boot/15-messages/02-project-hierarchy.png)


运行结果
==================

发送消息
------------------

使用如下URL发送消息内容为`hifreud` - `http://localhost:9090/send?content=hifreud`

![/images/blog/spring-boot/15-messages/03-send-message-to-queue.png](/images/blog/spring-boot/15-messages/03-send-message-to-queue.png)

接收消息
------------------

查看控制台输出。

![/images/blog/spring-boot/15-messages/04-receive-message-from-queue.png](/images/blog/spring-boot/15-messages/04-receive-message-from-queue.png)


参考资料
==================

Spring Boot Reference Guide : [http://docs.spring.io/spring-boot/docs/current-SNAPSHOT/reference/htmlsingle/](http://docs.spring.io/spring-boot/docs/current-SNAPSHOT/reference/htmlsingle/)

《JavaEE开发的颠覆者 Spring Boot实战》 - 汪云飞
