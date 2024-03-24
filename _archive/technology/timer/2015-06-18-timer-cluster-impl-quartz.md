---
layout: post
title:  定时器之（三） - 定时器模块集群实现 - quartz与Spring的结合实现集群和非集群的定时器
date:   2015-06-18 16:00:00 +0800
categories: 技术文档
tag: 定时器设计
---

* content
{:toc}


版本
===========================
{% highlight xml %}
<spring.version>3.1.0.RELEASE</spring.version>
<dependency> 
	<groupId>org.quartz-scheduler</groupId> 
	<artifactId>quartz</artifactId> 
	<version>1.8.6</version>
</dependency>
{% endhighlight%}

非集群
===========================

application-quartz-singleton.xml
----------------------
{% highlight xml %}
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
	xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans-3.0.xsd">
	
	<bean id="SingetonTimerSample" class="com.freud.test.demo.SingletonTimerSample" />
	
	<!--配置调度具体执行的方法 -->
	<bean id="SingetonJobSample"
		class="org.springframework.scheduling.quartz.MethodInvokingJobDetailFactoryBean">
		<property name="targetObject" ref="SingetonTimerSample" />
		<property name="targetMethod" value="helloWorld" />
		<property name="concurrent" value="false" />
	</bean>
	<!--配置调度执行的触发的时间 -->
	<bean id="SingletonTriggerSample" class="org.springframework.scheduling.quartz.CronTriggerBean">
		<property name="jobDetail" ref="SingetonJobSample" />
		<property name="cronExpression">
			<!-- 每5秒执行一次 -->
			<value>0/5 * * * * ?</value>
		</property>
	</bean>
	
	<!-- quartz的调度工厂 调度工厂只能有一个，多个调度任务在list中添加 -->
	<bean id="singletonSchedulerFactory" class="org.springframework.scheduling.quartz.SchedulerFactoryBean">
		<property name="triggers">
			<list>
				<!-- 所有的调度列表 -->
				<ref local="SingletonTriggerSample" />
			</list>
		</property>
	</bean>
</beans>
{% endhighlight%}

SingletonTimerSample.java
----------------------
{% highlight java %}
package com.freud.test.demo;

import java.util.Date;

import org.springframework.beans.factory.annotation.Autowired;

/**
 * @author Freud
 */
public class SingletonTimerSample
{
    @Autowired
    private TestService testService;
    
    public void helloWorld()
    {
        System.out.println(new Date() + "Hello Sample Singeton Timer!");
        try
        {
            testService.index("Singleton");
        }
        catch (Exception e)
        {
            e.printStackTrace();
        }
    }
}
{% endhighlight%}

TestService.java
----------------------
{% highlight java %}
package com.freud.test.demo;

import java.util.Date;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * @author Freud
 */
 @Service("TestService")
public class TestService
{
    
    public void index(String mode)
        throws Exception
    {
        System.out.println(new Date() + "[" + mode + "]Test Quartz with Spring IOC");
    }

}
{% endhighlight%}

集群方式(支持Spring注入)
===========================

application-quartz-cluster.xml
----------------------
{% highlight xml %}
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:util="http://www.springframework.org/schema/util"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans-3.0.xsd
                        http://www.springframework.org/schema/util http://www.springframework.org/schema/util/spring-util-3.0.xsd"
       default-lazy-init="false">

    <!-- Quartz集群Schduler -->
    <bean id="clusterQuartzScheduler" class="org.springframework.scheduling.quartz.SchedulerFactoryBean">
        <!-- Triggers集成 -->
        <property name="triggers">
            <list>
                <ref bean="ClusterTriggerSample" />
            </list>
        </property>
        
        <!--  quartz配置文件路径-->
        <property name="configLocation" value="classpath:conf/quartz.properties" />
        <property name="applicationContextSchedulerContextKey" value="applicationContext" />
        <property name="jobFactory">
            <bean class="com.freud.test.AutoWiringSpringBeanJobFactory" />
        </property>
    </bean>

    <bean id="ClusterTriggerSample" class="org.springframework.scheduling.quartz.CronTriggerBean">
        <property name="jobDetail" ref="ClusterJobDetailSample" />
        <!-- 每10秒执行一次 -->
        <property name="cronExpression" value="0/10 * * * * ?" />
    </bean>

    <!-- Timer JobDetail, 基于JobDetailBean实例化Job Class,可持久化到数据库实现集群 -->
    <bean id="ClusterJobDetailSample" class="org.springframework.scheduling.quartz.JobDetailBean">
        <property name="jobClass" value="com.freud.test.demo.ClusterTimerSample" />
    </bean>
    
</beans>
{% endhighlight%}

quartz.properties
----------------------
{% highlight text %}
#============================================================================
# Configure Main Scheduler Properties
#============================================================================
org.quartz.scheduler.instanceName = ClusteredScheduler
org.quartz.scheduler.instanceId = AUTO
#org.quartz.scheduler.skipUpdateCheck = true
#============================================================================
# Configure ThreadPool
#============================================================================
org.quartz.threadPool.class = org.quartz.simpl.SimpleThreadPool
org.quartz.threadPool.threadCount = 10
org.quartz.threadPool.threadPriority = 5
#============================================================================
# Configure JobStore
#============================================================================
org.quartz.jobStore.class = org.quartz.impl.jdbcjobstore.JobStoreTX
org.quartz.jobStore.driverDelegateClass = org.quartz.impl.jdbcjobstore.MSSQLDelegate
org.quartz.jobStore.misfireThreshold = 6000
org.quartz.jobStore.useProperties = false
org.quartz.jobStore.tablePrefix = QRTZ_
org.quartz.jobStore.isClustered = true
org.quartz.jobStore.clusterCheckinInterval = 15000


org.quartz.jobStore.dataSource = freudDS
#==============================================================
#Non-Managed Configure Datasource
#==============================================================
org.quartz.dataSource.freudDS.driver = com.mysql.jdbc.Driver
org.quartz.dataSource.freudDS.URL = jdbc:mysql://localhost:3306/quartz?useUnicode=true&amp;characterEncoding=UTF-8
org.quartz.dataSource.freudDS.user = root
org.quartz.dataSource.freudDS.password = root
org.quartz.dataSource.freudDS.maxConnections = 100
{% endhighlight%}

ClusterTimerSample.java
----------------------
{% highlight java %}
package com.freud.test.demo;

import java.util.Date;

import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.quartz.QuartzJobBean;

/**
 * @author Freud
 */
public class ClusterTimerSample extends QuartzJobBean
{
    @Autowired
    private TestService testService;

    @Override
    protected void executeInternal(JobExecutionContext arg0)
        throws JobExecutionException
    {
        System.out.println(new Date() + "Hello Cluster Timer sample!");
        try
        {
            testService.index("cluster");
        }
        catch (Exception e)
        {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
    }
    
}
{% endhighlight%}

AutoWiringSpringBeanJobFactory.java
----------------------
{% highlight java %}
package com.freud.test;

import org.quartz.spi.TriggerFiredBundle;
import org.springframework.beans.factory.config.AutowireCapableBeanFactory;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.scheduling.quartz.SpringBeanJobFactory;

/**
 * @author Freud
 */
public class AutoWiringSpringBeanJobFactory extends SpringBeanJobFactory implements ApplicationContextAware
{
    private transient AutowireCapableBeanFactory beanFactory;
    
    public void setApplicationContext(final ApplicationContext context)
    {
        beanFactory = context.getAutowireCapableBeanFactory();
    }
    
    @Override
    protected Object createJobInstance(final TriggerFiredBundle bundle)
        throws Exception
    {
        final Object job = super.createJobInstance(bundle);
        beanFactory.autowireBean(job);
        return job;
    }
}
{% endhighlight%}

其他
===============
最后把application-quartz-cluster.xml和application-quartz-singleton.xml引入Spring的ApplicationContext.xml文件就可以了

遇到的问题
===============
1. 数据库版本问题，在Mysql5.6.21下运行集群一直不成功,程序未报任何错误，但是集群Job不会运行，而切到5.5.*下就可以了。
2. Quartz支持插件式的配置开发，而要使用的话，就需要使用如下的Jar包
{% highlight xml %}
<dependency>
    <groupId>javax.transaction</groupId>
    <artifactId>jta</artifactId>
    <version>1.1</version>
</dependency>
<dependency>
    <groupId>quartz</groupId>
    <artifactId>quartz</artifactId>
    <version>1.5.2</version>
</dependency>
{% endhighlight %}
3. Spring 3.*只支持quartz 1.*
4. Oracle JDK从5.0开始在某些条件(特别是多线程)下已经不建议使用Timer，而是使用`java.util.concurrent.ScheduledThreadPoolExecutor`来代替。
5. Quartz集群中给机器命名的方式(InstanceIdGenerator)有三种，分别是`HostnameInstanceIdGenerator`,`SimpleInstanceIdGenerator`和`SystemPropertyInstanceIdGenerator`，在`org.quartz.scheduler.instanceId = AUTO` 配置为AUTO即使用默认的`SimpleInstanceIdGenerator`，即

{% highlight java %}
package org.quartz.simpl;

import java.net.InetAddress;

import org.quartz.SchedulerException;
import org.quartz.spi.InstanceIdGenerator;

/**
 * The default InstanceIdGenerator used by Quartz when instance id is to be
 * automatically generated.  Instance id is of the form HOSTNAME + CURRENT_TIME.
 * 
 * @see InstanceIdGenerator
 * @see HostnameInstanceIdGenerator
 */
public class SimpleInstanceIdGenerator implements InstanceIdGenerator {
    public String generateInstanceId() throws SchedulerException {
        try {
            return InetAddress.getLocalHost().getHostName() + System.currentTimeMillis();
        } catch (Exception e) {
            throw new SchedulerException("Couldn't get host name!", e);
        }
    }
}
{% endhighlight %}

但是在linux环境下，如果没有配置机器别名的话，就会在`InetAddress.getLocalHost().getHostName()`报错，解决方案有2步，先`hostname`看下机器名是否是乱码，如果不是，就在`/etc/hosts`文件中添加

{% highlight bash %}
127.0.0.1 localhost ${hostname}
{% endhighlight %}

<br />
<br />