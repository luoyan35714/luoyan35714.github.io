---
layout: post
title:  微服务--API版本控制
date:   2018-01-30 15:54:54 +0800
categories: 微服务
tag: 教程
---

* content
{:toc}


API版本控制常用实践
=============

+ URL
    
    `http://example.com/v1/helloworld`

+ HEADER

    ![/images/blog/micro-service/api-versioning/01-api-version-header.png](/images/blog/micro-service/api-versioning/01-api-version-header.png)


各大公司做法
=============

[http://www.lexicalscope.com/blog/2012/03/12/how-are-rest-apis-versioned/](http://www.lexicalscope.com/blog/2012/03/12/how-are-rest-apis-versioned/)


Spring Boot实践API版本管理
=============

原理
-------------

在SpringMVC中RequestMappingHandlerMapping是比较重要的一个角色，它决定了每个URL分发至哪个Controller。

Spring Boot加载过程如下，所以我们可以通过自定义WebMvcRegistrationsAdapter来改写RequestMappingHandlerMapping。

![/images/blog/micro-service/api-versioning/02-spring-boot-load-step.png](/images/blog/micro-service/api-versioning/02-spring-boot-load-step.png)

ApiVersion.java
-------------

{% highlight java %}
package com.freud.apiversioning.configuration;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import org.springframework.web.bind.annotation.Mapping;

@Target({ ElementType.METHOD, ElementType.TYPE })
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Mapping
public @interface ApiVersion {

    /**
     * version
     * 
     * @return
     */
    int value();
}
{% endhighlight %}

ApiVersionCondition.java
-------------

{% highlight java %}
package com.freud.apiversioning.configuration;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.servlet.http.HttpServletRequest;

import org.springframework.web.servlet.mvc.condition.RequestCondition;

public class ApiVersionCondition implements RequestCondition<ApiVersionCondition> {

    // extract the version part from url. example [v0-9]
    private final static Pattern VERSION_PREFIX_PATTERN = Pattern.compile("v(\\d+)/");

    private int apiVersion;

    public ApiVersionCondition(int apiVersion) {
        this.apiVersion = apiVersion;
    }

    public ApiVersionCondition combine(ApiVersionCondition other) {
        // latest defined would be take effect, that means, methods definition with
        // override the classes definition
        return new ApiVersionCondition(other.getApiVersion());
    }

    public ApiVersionCondition getMatchingCondition(HttpServletRequest request) {
        Matcher m = VERSION_PREFIX_PATTERN.matcher(request.getRequestURI());
        if (m.find()) {
            Integer version = Integer.valueOf(m.group(1));
            if (version >= this.apiVersion) // when applying version number bigger than configuration, then it will take
                                            // effect
                return this;
        }
        return null;
    }

    public int compareTo(ApiVersionCondition other, HttpServletRequest request) {
        // when more than one configured version number passed the match rule, then only
        // the biggest one will take effect.
        return other.getApiVersion() - this.apiVersion;
    }

    public int getApiVersion() {
        return apiVersion;
    }

}
{% endhighlight %}

ApiVersioningRequestMappingHandlerMapping.java
-------------

{% highlight java %}
package com.freud.apiversioning.configuration;

import org.springframework.core.annotation.AnnotationUtils;
import org.springframework.web.servlet.mvc.condition.RequestCondition;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;

import java.lang.reflect.Method;

public class ApiVersioningRequestMappingHandlerMapping extends RequestMappingHandlerMapping {

    @Override
    protected RequestCondition<ApiVersionCondition> getCustomTypeCondition(Class<?> handlerType) {
        ApiVersion apiVersion = AnnotationUtils.findAnnotation(handlerType, ApiVersion.class);
        return createCondition(apiVersion);
    }

    @Override
    protected RequestCondition<ApiVersionCondition> getCustomMethodCondition(Method method) {
        ApiVersion apiVersion = AnnotationUtils.findAnnotation(method, ApiVersion.class);
        return createCondition(apiVersion);
    }

    private RequestCondition<ApiVersionCondition> createCondition(ApiVersion apiVersion) {
        return apiVersion == null ? null : new ApiVersionCondition(apiVersion.value());
    }
}
{% endhighlight %}

WebMvcRegistrationsConfig.java
-------------

{% highlight java %}
package com.freud.apiversioning.configuration;

import org.springframework.boot.autoconfigure.web.WebMvcRegistrationsAdapter;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;

@Configuration
public class WebMvcRegistrationsConfig extends WebMvcRegistrationsAdapter {

    @Override
    public RequestMappingHandlerMapping getRequestMappingHandlerMapping() {
        return new ApiVersioningRequestMappingHandlerMapping();
    }

}
{% endhighlight %}


测试
=============

TestVersioningController.java
-------------

{% highlight java %}
package com.freud.apiversioning.v1.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.freud.apiversioning.configuration.ApiVersion;

@ApiVersion(1)
@RequestMapping("/{api_version}")
@RestController("TestVersioningController-v1")
public class TestVersioningController {

    @RequestMapping("/hello")
    public String hello() {
        return "hello v1";
    }
}
{% endhighlight %}

TestVersioningController.java
-------------

{% highlight java %}
package com.freud.apiversioning.v2.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.freud.apiversioning.configuration.ApiVersion;

@ApiVersion(2)
@RequestMapping("/{api_version}")
@RestController("TestVersioningController-v2")
public class TestVersioningController {

    @RequestMapping("/hello")
    public String hello() {
        return "hello v2";
    }
}
{% endhighlight %}

ApiVersioningApplication.java
-------------

{% highlight java %}
package com.freud.apiversioning;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ApiVersioningApplication {

    public static void main(String[] args) {
        SpringApplication.run(ApiVersioningApplication.class, args);
    }
}
{% endhighlight %}

application.yml
-------------

{% highlight java %}
server:
  port: 7905
{% endhighlight %}

项目结构
-------------

![/images/blog/micro-service/api-versioning/03-project-hierarchy.png](/images/blog/micro-service/api-versioning/03-project-hierarchy.png)


演示
=============

v1
-------------

访问`http://localhost:7905/v1/hello`

![/images/blog/micro-service/api-versioning/04-result-v1.png](/images/blog/micro-service/api-versioning/04-result-v1.png)

v2
-------------

访问`http://localhost:7905/v2/hello`

![/images/blog/micro-service/api-versioning/05-result-v2.png](/images/blog/micro-service/api-versioning/05-result-v2.png)

v100
-------------

访问`http://localhost:7905/v100/hello`

![/images/blog/micro-service/api-versioning/06-result-v100.png](/images/blog/micro-service/api-versioning/06-result-v100.png)


參考資料
=============

Spring Boot API 版本权限控制: [http://blog.csdn.net/u010782227/article/details/74905404](http://blog.csdn.net/u010782227/article/details/74905404)

让SpringMVC支持可版本管理的Restful接口：[http://www.cnblogs.com/jcli/p/springmvc_restful_version.html](http://www.cnblogs.com/jcli/p/springmvc_restful_version.html)

如何做到API兼容: [https://kb.cnblogs.com/page/108253/](https://kb.cnblogs.com/page/108253/)

解析@EnableWebMvc 、WebMvcConfigurationSupport和WebMvcConfigurationAdapter: [http://blog.csdn.net/pinebud55/article/details/53420481](http://blog.csdn.net/pinebud55/article/details/53420481)

How are REST APIs versioned?: [http://blog.csdn.net/pinebud55/article/details/53420481](http://blog.csdn.net/pinebud55/article/details/53420481)
