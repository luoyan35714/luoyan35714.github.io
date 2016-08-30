---
layout: post
title:  Spring 使用笔记之(六) - 非Spring托管的类中使用SpringBean的方法
date:   2015-03-31 09:40:00 +0800
categories: 技术文档
tag: Spring
---

* content
{:toc}


继承`ApplicationContextAware`接口，并注入静态`ApplicationContext`对象
--------------------------------

{% highlight java %}
package com.freud.test.spring;

import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;

/**
 * 
 * Spring context 的支持类
 * 
 * @author Freud
 */
public class SpringContextHolder implements ApplicationContextAware
{
    
    private static ApplicationContext applicationContext;
    
    public void setApplicationContext(ApplicationContext applicationContext)
    {
        SpringContextHolder.applicationContext = applicationContext;
    }
    
    /**
     * 得到Spring 上下文环境
     * 
     * @return
     */
    public static ApplicationContext getApplicationContext()
    {
        checkApplicationContext();
        return applicationContext;
    }
    
    /**
     * 通过Spring Bean name 得到Bean
     * 
     * @param name bean 上下文定义名称
     */
    @SuppressWarnings("unchecked")
    public static <T> T getBean(String name)
    {
        checkApplicationContext();
        return (T)applicationContext.getBean(name);
    }
    
    /**
     * 通过类型得到Bean
     * 
     * @param clazz
     * @return
     */
    @SuppressWarnings("unchecked")
    public static <T> T getBean(Class<T> clazz)
    {
        checkApplicationContext();
        return applicationContext.getBean(clazz);
    }
    
    private static void checkApplicationContext()
    {
        if (applicationContext == null)
        {
            throw new IllegalStateException("applicaitonContext未注入,请在application-context.xml中定义SpringContextHolder");
        }
    }
    
}
{% endhighlight%}

在Spring的配置文件中声明新定义的Bean
--------------------------------

{% highlight xml %}
	<bean id="springContextHolder" class="com.freud.test.spring.SpringContextHolder" />
{% endhighlight %}

使用
--------------------------------

{% highlight xml %}
	SpringContextHolder.getBean("testService");
{% endhighlight %}

问题
--------------------------------

当使用XML配置的方式，SpringContextHolder可以获得所有的声明Bean，但是一旦使用注解方式声明Bean，就会导致找不到。
`SpringContextHolder.getBean("testService")`会是Null。
<br />
问题是由于Spring MVC与Spring的上下文管理不在一个容器中，而我的自动扫描路径配置在了Spring MVC的web-app-servlet.xml中，导致Spring找不这些bean

解决方法
--------------------------------

解决方法有2中
* 第一种是把所有的自动扫描放到Spring的ApplicationContext.xml文件中
{% highlight xml %}
<context:annotation-config />

<context:component-scan base-package="com.freud.test.**.service" />
{% endhighlight %}

* 第二种是在web.xml文件中Spring的contextConfigLocation中添加上web-app-servlet.xml的配置
{% highlight xml %}
<context-param>
	<param-name>contextConfigLocation</param-name>
	<param-value>/WEB-INF/web-app-servlet.xml,classpath:application-context.xml</param-value>
</context-param>
{% endhighlight %}