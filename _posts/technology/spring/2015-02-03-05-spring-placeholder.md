---
layout: post
title:  Spring 使用笔记之(三) - Placeholder
date:   2015-02-03 15:00:00 +0800
categories: 技术文档
tag: Spring
---

* content
{:toc}


PlaceHolder
-------------------------------------
在Spring中，Placeholder的实现有2种方式，第一种是Context标签下的property-placeholder，第二种是PropertyPlaceholderConfigure的Bean配置。

Context标签下的property-placeholder
============================================
在配置文件中引入如下操作就可以在代码中使用诸如`${jdbc.username}`占位了。
{% highlight xml %}
xmlns:context="http://www.springframework.org/schema/context"
xsi:schemaLocation="http://www.springframework.org/schema/context http://www.springframework.org/schema/context/spring-context-3.0.xsd"

<context:property-placeholder location="classpath:/test.properties"/>

{% endhighlight %}

PropertyPlaceholderConfigure
============================================
这种方式比较强大，支持从JVM系统属性（System.getProperty()）和环境变量（System.getenv()）中寻找。通过启用systemPropertiesMode和searchSystemEnvironment属性，开发者能够控制这一行为。

{% highlight xml %}
<bean
	class="org.springframework.beans.factory.config.PropertyPlaceholderConfigurer">
	<property name="ignoreResourceNotFound" value="true" />
	<property name="locations" value="classpath:/test.properties" />
</bean>
{% endhighlight %}



参考资料
============================

[http://blog.sina.com.cn/s/blog_4550f3ca0100ubmt.html](http://blog.sina.com.cn/s/blog_4550f3ca0100ubmt.html)

