---
layout: post
title:  Spring 使用笔记之(四) - 配置DataSource多数据源
date:   2015-02-25 16:33:00 +0800
categories: 技术文档
tag: Spring
---

* content
{:toc}


> 核心思想：Spring在每次操作数据库的时候都会通过AbstractRoutingDataSource类中的determineTargetDataSource()方法获取当前数据源，我们就可以通过切面技术，在不同的切面，切入不同的数据源名称，使Spring获取的时候拿到的是不同的数据源。

![AbstractRoutingDataSource类中的determineTargetDataSource()方法的源码](/images/blog/spring/07-spring-datasource/01_source_determinate.png)

而`determineCurrentLookupKey()`方法是抽象的，所以，我们可以实现这个类，重写determineCurrentLookupKey方法，通过切面技术实现多数据源之间切换
{% highlight java %}
/**
 * Determine the current lookup key. This will typically be
 * implemented to check a thread-bound transaction context.
 * <p>Allows for arbitrary keys. The returned key needs
 * to match the stored lookup key type, as resolved by the
 * {@link #resolveSpecifiedLookupKey} method.
 */
protected abstract Object determineCurrentLookupKey();
{% endhighlight %}


具体实现如下
----------------------------

Spring 中DataSource的定义如下
============================
{% highlight java %}
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
	xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:aop="http://www.springframework.org/schema/aop"
	xmlns:tx="http://www.springframework.org/schema/tx"
	xsi:schemaLocation="
		http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans-3.0.xsd
		http://www.springframework.org/schema/aop http://www.springframework.org/schema/aop/spring-aop-3.0.xsd
		http://www.springframework.org/schema/tx http://www.springframework.org/schema/tx/spring-tx-3.0.xsd">

	<!-- PlaceHolder Configuration -->
	<bean
		class="org.springframework.beans.factory.config.PropertyPlaceholderConfigurer">
		<property name="ignoreResourceNotFound" value="true" />
		<property name="locations" value="classpath*:/db/jdbc.properties" />
	</bean>

	<!-- 第一个基于dbcp的datasource -->
	<bean id="dataSource" class="org.apache.commons.dbcp.BasicDataSource"
		destroy-method="close">
		<!-- Connection Info -->
		<property name="driverClassName" value="${jdbc.driverClassName}" />
		<property name="url" value="${jdbc.url}" />
		<property name="username" value="${jdbc.username}" />
		<property name="password" value="${jdbc.password}" />

		<!-- Connection Pooling Info -->
		<property name="maxActive" value="${dbcp.maxActive}" />
		<property name="maxIdle" value="${dbcp.maxIdle}" />
		<property name="defaultAutoCommit" value="false" />
		<property name="timeBetweenEvictionRunsMillis" value="3600000" />
		<property name="minEvictableIdleTimeMillis" value="3600000" />
	</bean>

	<!-- 第二个基于dbcp的datasource -->
	<bean id="dataSource2" class="org.apache.commons.dbcp.BasicDataSource"
		destroy-method="close">
		<!-- Connection Info -->
		<property name="driverClassName" value="${jdbc.driverClassName}" />
		<property name="url" value="${jdbc.url2}" />
		<property name="username" value="${jdbc.username}" />
		<property name="password" value="${jdbc.password}" />

		<!-- Connection Pooling Info -->
		<property name="maxActive" value="${dbcp.maxActive}" />
		<property name="maxIdle" value="${dbcp.maxIdle}" />
		<property name="defaultAutoCommit" value="false" />
		<property name="timeBetweenEvictionRunsMillis" value="3600000" />
		<property name="minEvictableIdleTimeMillis" value="3600000" />
	</bean>

	<bean id="dynamicDataSource"
		class="com.freud.test.db.multires.DynamicDataSource">
		<property name="targetDataSources">
			<map key-type="java.lang.String">
				<entry value-ref="dataSource" key="dataSource" />
				<entry value-ref="dataSource2" key="dataSource2" />
			</map>
		</property>
		<property name="defaultTargetDataSource" ref="dataSource" />
	</bean>

	<!--MyBatis integration with Spring as define sqlSessionFactory -->
	<bean id="sqlSessionFactory" class="org.mybatis.spring.SqlSessionFactoryBean">
		<property name="dataSource" ref="dynamicDataSource" />
	</bean>

	<bean id="mapperScanner" class="org.mybatis.spring.mapper.MapperScannerConfigurer">
		<property name="basePackage"
			value="com.freud.**.mapper;" />
		<property name="sqlSessionFactory" ref="sqlSessionFactory" />
	</bean>

	<!-- transaction manager, use JtaTransactionManager for global tx -->
	<bean id="transactionManager"
		class="org.springframework.jdbc.datasource.DataSourceTransactionManager">
		<property name="dataSource" ref="dynamicDataSource" />
	</bean>

	<tx:annotation-driven transaction-manager="transactionManager" />
 
	<bean id="dataSourceInterceptor" class="com.freud.db.multires.DataSourceInterceptor"/>
	
	<aop:config>
		<aop:aspect ref="dataSourceInterceptor">
			<aop:pointcut id="default"
				expression="execution(* com.freud.**.*(..))" />
			<aop:pointcut id="test1"
				expression="execution(* com.freud.test1.*.mapper.*.*(..))" />
			<aop:pointcut id="test2"
				expression="execution(* com.freud.test2.*.mapper.*.*(..))" />
			<aop:before pointcut-ref="default" method="setdataSourceOne" />
			<aop:before pointcut-ref="test1" method="setdataSourceOne" />
			<aop:before pointcut-ref="test2" method="setdataSourceTwo" />
		</aop:aspect>
	</aop:config>
	
</beans> 
{% endhighlight %}

DynamicDataSource.java
============================
{% highlight java %}
package com.freud.test.db.multires;

import org.springframework.jdbc.datasource.lookup.AbstractRoutingDataSource;

/**
 * @author Freud
 */
public class DynamicDataSource extends AbstractRoutingDataSource {

	@Override
	protected Object determineCurrentLookupKey() {
		return DatabaseContextHolder.getCustomerType();
	}

}
{% endhighlight %}

DataSourceInterceptor.java
============================
{% highlight java %}
package com.freud.test.db.multires;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.aspectj.lang.JoinPoint;

public class DataSourceInterceptor {

	private static final String DATESOURCE_ONE = "dataSource";
	private static final String DATESOURCE_TWO = "dataSource2";

	public void setdataSourceOne() {
		DatabaseContextHolder.setCustomerType(DATESOURCE_ONE);
	}

	public void setdataSourceTwo() {
		DatabaseContextHolder.setCustomerType(DATESOURCE_TWO);
	}
}
{% endhighlight %}

DatabaseContextHolder.java
============================
{% highlight java %}
package com.freud.test.db.multires;

import com.freud.common.thread.ThreadLocalUtils;

public class DatabaseContextHolder {

	public static final String DATA_DOURCE = "DATA_SOURCE";

	public static void setCustomerType(String customerType) {
		ThreadLocalUtils.put(DATA_DOURCE, customerType);
	}

	public static String getCustomerType() {
		return ThreadLocalUtils.get(DATA_DOURCE);
	}

	public static void clearCustomerType() {
		ThreadLocalUtils.remove(DATA_DOURCE);
	}
}
{% endhighlight %}


ThreadLocalUtils.java
============================
{% highlight java %}
package com.freud.common.thread;

import java.util.HashMap;
import java.util.Map;

public final class ThreadLocalUtils {

	private static final ThreadLocal<Map<String, String>> threadContext = new ThreadLocal<Map<String, String>>();

	public static void put(String key, String value) {
		getContext().put(key, value);
	}

	public static String get(String key) {
		return getContext().get(key);
	}

	public static void remove(String key) {
		getContext().remove(key);
	}

	public static Map<String, String> getContext() {
		Map<String, String> value = threadContext.get();
		if (null == value) {
			threadContext.set(new HashMap<String, String>());
		}
		return threadContext.get();
	}
}
{% endhighlight %}


> 如上操作之后，只需要将需要不同Datasource的Mapper层配置在Spring的DataSource切面配置中就可以实现多数据源的自由切换。

总结
----------------------------
这个方案完全是在spring的框架下解决的，数据源依然配置在spring的配置文件中，sessionFactory依然去配置它的dataSource属性，它甚至都不知道dataSource的改变。唯一不同的是在真正的dataSource与sessionFactory之间基于Decorator(装饰者)模式增加了一个MultiDataSource。

<br />
<br />

参考资料
======================

[Spring mvc动态多数据源](http://blog.csdn.net/geloin/article/details/7580685)

[spring框架中多数据源创建加载并且实现动态切换的配置实例代码](http://www.zuidaima.com/share/1774074130205696.htm)
