---
layout: post
title:  Spring Boot学习笔记(二三) - 安全
date:   2017-07-13 13:49:00 +0800
categories: Spring Boot
tag: 教程
---

* content
{:toc}


安全
==================

Spring Boot提供三个层级的安全设置

+ Spring Security ：用作WEB应用的登录
+ OAuth 2 ：用作认证服务器
+ Actuator Security ：用作Actuator的安全设置

> 本次只简单探索下Spring Security在Spring Boot中的应用。

Spring Security
------------------

Spring Boot针对Spring Security的自动配置在org.springframework.boot.autoconfigure.security包中。

如果添加了Spring Security的依赖，那么web应用默认对所有的HTTP路径（也称为终点，端点，表示API的具体网址）使用`basic`认证。为了给web应用添加方法级别（method-level）的保护，可以添加 `@EnableGlobalMethodSecurity` 并使用想要的设置，其他信息参考[Spring Security Reference](http://docs.spring.io/spring-security/site/docs/4.2.3.RELEASE/reference/htmlsingle#jc-method)。

默认的 `AuthenticationManager` 只有一个用户（用户名为`user`的用户名, 随机密码会在应用启动时以INFO日志级别打印出来）

默认的安全配置是通过 `SecurityAutoConfiguration` ， `SpringBootWebSecurityConfiguration`（用于web安全）， `AuthenticationManagerConfiguration` （可用于非web应用的认证配置）进行管理的。可以添加一个 `@EnableWebSecurity` bean来彻底关掉Spring Boot的默认配置。为了对它进行自定义，需要使用外部的属性配置和 `WebSecurityConfigurerAdapter` 类型的beans（比如，添加基于表单的登陆）。 想要关闭认证管理的配置，可以添加一个 `AuthenticationManager` 类型的bean，或在 `@Configuration` 类的某个方法里注入 `AuthenticationManagerBuilder` 来配置全局的 `AuthenticationManager` 。

这里有一些安全相关的[Spring Boot应用示例](https://github.com/spring-projects/spring-boot/tree/v1.5.4.RELEASE/spring-boot-samples/)可以拿来参考。

在web应用中能得到的开箱即用的基本特性如下：

1. 一个使用内存存储的 `AuthenticationManager` bean和一个用户（查看 `SecurityProperties.User` 获取user的属性）。
2. 忽略（不保护）常见的静态资源路径（ `/css/**`, `/js/**`, `/images/**` ， `/webjars/**` 和 `**/favicon.ico` ）。
3. 对其他所有路径实施HTTP Basic安全保护。
4. 安全相关的事件会发布到Spring的 `ApplicationEventPublisher` （成功和失败的认证，拒绝访问）。
5. Spring Security提供的常见底层特性（HSTS, XSS, CSRF, 缓存）默认都被开启。

上述所有特性都能通过外部配置（ `security.*` ）打开，关闭，或修改。想要覆盖访问规则而不改变其他自动配置的特性，可以添加一个注解 `@Order(SecurityProperties.ACCESS_OVERRIDE_ORDER)` 的 `WebSecurityConfigurerAdapter` 类型的 @Bean 。当我们自己扩展的配置时，只需配置类基础呢个`WebSecurityConfigurerAdapter`就可以了。

{% highlight java %}
@Configuration
public class WebSecurityConfig extends WebSecurityConfigureAdapter {
}
{% endhighlight %}

SecurityProperties使用以`security`为前缀的属性配置Spring Security相关的配置，

{% highlight text %}
security.user.name=user #内存中的用户默认帐号为user
security.user.password= # 默认用户的密码
security.user.role=USER # 默认用户的角色
security.require-ssl=false # 是否需要SSL支持
security.enable-csrf=false # 是否开启"跨站请求伪造"支持，默认关闭
security.basic.enabled=
security.basic.realm=
security.basic.path= # /**
security.basicauthorize-mode=
security.filter-order=0
security.headers.xss=false
security.headers.cache=false
security.headers.frame=false
security.headers.content-type=false
security.headers.hsts=all
security.sessions=stateless
security.ignored= # 用逗号隔开的无需拦截的路径
{% endhighlight %}


实验
==================

> 本实验基于Spring Security, MYSQL和Thymeleaf实现。

创建数据库
------------------

{% highlight sql %}
DROP DATABASE IF EXISTS `security-test`;
CREATE DATABASE `security-test`;
{% endhighlight %}

创建一个Maven项目
------------------

![/images/blog/spring-boot/24-security/01-new-maven-project.png](/images/blog/spring-boot/24-security/01-new-maven-project.png)

pom.xml
------------------

{% highlight xml %}
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.freud.test</groupId>
    <artifactId>spring-boot-24</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <packaging>jar</packaging>

    <name>spring-boot-24</name>
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
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-thymeleaf</artifactId>
        </dependency>
        <dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
        </dependency>
        <dependency>
            <groupId>org.thymeleaf.extras</groupId>
            <artifactId>thymeleaf-extras-springsecurity4</artifactId>
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
    name: test-24
  jpa:
    show-sql: true
    hibernate:
      ddl-auto: update
  datasource:
    driver-class-name: com.mysql.jdbc.Driver
    url: jdbc:mysql://localhost:3306/security-test?useSSL=false
    username: root
    password: root
  thymeleaf: 
    cache: false
server: 
  port: 9090
{% endhighlight %}

index.html
------------------

{% highlight java %}
<!DOCTYPE html>
<html lang="en" xmlns:th="http://www.thymeleaf.org"
      xmlns:sec="http://www.thymeleaf.org/thymeleaf-extras-springsecurity4">
<head>
    <meta charset="UTF-8"/>
    <title>首页展示</title>
     <style type="text/css">
        table {
            border-spacing: 0px;
            border-collapse: 0px;
            border-width: 3px;
            border-color: black;
        }
    </style>
</head>
<body>
    <div>
        <h2>权限展示</h2>
        <table border="1">
            <thead>
                <tr>
                    <td>Names</td>
                    <td>Values</td>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Login User:</td>
                    <td sec:authentication="name"></td>
                </tr>
                <tr>
                    <td>Title:</td>
                    <td th:text="${content}"></td>
                </tr>
                <tr sec:authorize="hasRole('ROLE_ADMIN')">
                    <td>Admin Role Show:</td>
                    <td th:text="${adminMsg}"></td>
                </tr>
                <tr sec:authorize="hasRole('ROLE_USER')">
                    <td>User RoleShow:</td>
                    <td th:text="${userMsg}"></td>
                </tr>
                <tr>
                    <td>Logout:</td>
                    <td>
                        <form th:action="@{/logout}" method="post">
                            <input type="submit" class="btn btn-primary" value="注销"/>
                        </form>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</body>
</html>
{% endhighlight %}

login.html
------------------

{% highlight java %}
<!DOCTYPE html>
<html lang="en" xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8"/>
    <title>登录</title>
    <style type="text/css">
        .bg-warning {
            color: pink;
        }
        .bg-danger {
            color: red;
        }
    </style>
</head>
<body>
<div>
    <div>
        <h2>登录</h2>
        <form th:action="@{/login}" action="/login" method="post">
            <div>
                <label>账号</label>
                <input type="text" name="username" value="" placeholder="账号"/>
            </div>
            <div>
                <label>密码</label>
                <input type="password" name="password" placeholder="密码"/>
            </div>
            <input type="submit" id="login" value="Login"/>
        </form>
        <br />
        <p th:if="${param.logout}" class="bg-warning">已注销</p>
        <p th:if="${param.error}" class="bg-danger">有错误，请重试</p>
    </div>
</div>
</body>
</html>
{% endhighlight %}

Role.java
------------------

{% highlight java %}
package com.freud.test.springboot.bean;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;

/**
 * @author Freud
 */
@Entity
public class Role {

    @Id
    @GeneratedValue
    private long id;
    @Column
    private String name;

    public long getId() {
        return id;
    }

    public void setId(long id) {
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

User.java
------------------

{% highlight java %}
package com.freud.test.springboot.bean;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.ManyToMany;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

/**
 * @author Freud
 */
@Entity
public class User implements UserDetails {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue
    private Long id;
    @Column
    private String username;
    @Column
    private String password;

    @ManyToMany(cascade = { CascadeType.REFRESH }, fetch = FetchType.EAGER)
    private List<Role> roles;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        List<GrantedAuthority> auths = new ArrayList<GrantedAuthority>();
        List<Role> roles = this.getRoles();
        for (Role role : roles) {
            auths.add(new SimpleGrantedAuthority(role.getName()));
        }
        return auths;
    }

    @Override
    public String getPassword() {
        return this.password;
    }

    @Override
    public String getUsername() {
        return this.username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public List<Role> getRoles() {
        return roles;
    }

    public void setRoles(List<Role> roles) {
        this.roles = roles;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public void setPassword(String password) {
        this.password = password;
    }

}
{% endhighlight %}

CustomUserService.java
------------------

{% highlight java %}
package com.freud.test.springboot.config;

import java.text.MessageFormat;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;

import com.freud.test.springboot.bean.User;
import com.freud.test.springboot.repository.UserRepository;

/**
 * @author Freud
 */
@Component
public class CustomUserService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findUserByUsername(username);
        if (user == null) {
            throw new UsernameNotFoundException(MessageFormat.format("用户名[{0}]不存在", username));
        }
        return user;
    }

}
{% endhighlight %}

MyPermissionEvaluator.java
------------------

{% highlight java %}
package com.freud.test.springboot.config;

import java.io.Serializable;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.PermissionEvaluator;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;

import com.freud.test.springboot.bean.User;
import com.freud.test.springboot.repository.UserRepository;

/**
 * @author Freud
 */
@Component
public class MyPermissionEvaluator implements PermissionEvaluator {

    @Autowired
    private UserRepository userRepository;

    @Override
    public boolean hasPermission(Authentication authentication, Object targetDomainObject, Object permission) {
        String username = authentication.getName();
        User user = userRepository.findUserByUsername(username);
        if (CollectionUtils.isEmpty(user.getRoles())) {
            return false;
        } else {
            return true;
        }
    }

    @Override
    public boolean hasPermission(Authentication authentication, Serializable targetId, String targetType,
            Object permission) {
        // not supported
        return false;
    }

}
{% endhighlight %}

SecurityConfig.java
------------------

{% highlight java %}
package com.freud.test.springboot.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.encoding.Md5PasswordEncoder;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.builders.WebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;

/**
 * @author Freud
 */
@Configuration
@EnableGlobalMethodSecurity(prePostEnabled = true)
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    @Autowired
    private CustomUserService customUserService;

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http.authorizeRequests().anyRequest().authenticated()
            .and().formLogin().loginPage("/login").failureUrl("/login?error").permitAll().defaultSuccessUrl("/", true)
            .and().logout().logoutUrl("/logout").logoutSuccessUrl("/login?logout").permitAll()
            .and().sessionManagement().maximumSessions(1).expiredUrl("/expired")
            .and()
            .and().exceptionHandling().accessDeniedPage("/accessDenied");
    }

    @Override
    public void configure(WebSecurity web) throws Exception {
        web.ignoring().antMatchers("/js/**", "/css/**", "/images/**", "/**/favicon.ico", "/resources/**");
    }

    @Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        auth.userDetailsService(customUserService).passwordEncoder(new Md5PasswordEncoder());
    }
}
{% endhighlight %}

HomeController.java
------------------

{% highlight java %}
package com.freud.test.springboot.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.ModelAndView;

/**
 * @author Freud
 */
@Controller
public class HomeController {

    @RequestMapping("/login")
    public String login() {
        return "login";
    }

    @RequestMapping({ "", "/", "/index" })
    public ModelAndView index() {
        ModelAndView mav = new ModelAndView();
        mav.setViewName("index");

        mav.addObject("title", "Just for Spring Security Test");
        mav.addObject("adminMsg", "Show only have ADMIN role.");
        mav.addObject("userMsg", "Show only have USER role.");

        return mav;
    }
}
{% endhighlight %}

UserRepository.java
------------------

{% highlight java %}
package com.freud.test.springboot.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.freud.test.springboot.bean.User;

/**
 * @author Freud
 */
public interface UserRepository extends JpaRepository<User, Long> {

    User findUserByUsername(String username);

}
{% endhighlight %}

App.java
------------------

{% highlight java %}
package com.freud.test.springboot;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * @author Freud
 */
@SpringBootApplication
public class App {

    public static void main(String[] args) {
        SpringApplication.run(App.class, args);
    }

}
{% endhighlight %}

项目结构
------------------

![/images/blog/spring-boot/24-security/02-project-hierarchy.png](/images/blog/spring-boot/24-security/02-project-hierarchy.png)

运行及结果
==================

初始化数据库脚本
------------------

程序启动后会在数据库初始化相关的数据表如下：

![/images/blog/spring-boot/24-security/03-create-database.png](/images/blog/spring-boot/24-security/03-create-database.png)

然后在数据库执行如下脚本插入初始化数据：

{% highlight sql %}
DELETE FROM `user_roles`;
DELETE FROM `role`;
DELETE FROM `user`;

INSERT INTO `role`
    (`id`,`name`) 
VALUES 
    (1,'ROLE_ADMIN'),
    (2,'ROLE_USER');
    
INSERT INTO `user`
    (`id`,`username`,`password`) 
VALUES 
    (1,'root','63a9f0ea7bb98050796b649e85481845'),
    (2,'admin','21232f297a57a5a743894a0e4a801fc3');
INSERT INTO `user_roles`
    (`user_id`,`roles_id`) 
VALUES 
    (1,1),
    (2,2);
{% endhighlight %}

访问登录界面
----------------

请求`http://localhost:9090/`, URL会重定向到`http://localhost:9090/login`

![/images/blog/spring-boot/24-security/04-run-result-login.png](/images/blog/spring-boot/24-security/04-run-result-login.png)

登录出错
----------------

输入错误的用户名和密码`aaa/aaa`

![/images/blog/spring-boot/24-security/05-run-result-login-with-error.png](/images/blog/spring-boot/24-security/05-run-result-login-with-error.png)

登录成功-ROLE_ADMIN
----------------

使用`root/root`用户登录之后，展示的是角色`ROLE_AMDIN`内容

![/images/blog/spring-boot/24-security/06-run-result-admin-role.png](/images/blog/spring-boot/24-security/06-run-result-admin-role.png)

登录成功-ROLE_USER
----------------

使用`admin/admin`用户登录之后，展示的是角色`ROLE_AMDIN`内容

![/images/blog/spring-boot/24-security/07-run-result-user-role.png](/images/blog/spring-boot/24-security/07-run-result-user-role.png)

注销
----------------

登录成功后点击注销

![/images/blog/spring-boot/24-security/08-run-result-logout.png](/images/blog/spring-boot/24-security/08-run-result-logout.png)


参考资料
==================

Spring Boot Reference Guide : [http://docs.spring.io/spring-boot/docs/current-SNAPSHOT/reference/htmlsingle/](http://docs.spring.io/spring-boot/docs/current-SNAPSHOT/reference/htmlsingle/)

《JavaEE开发的颠覆者 Spring Boot实战》 - 汪云飞

【Spring】关于Boot应用中集成Spring Security你必须了解的那些事 : [http://www.cnblogs.com/softidea/p/5991897.html](http://www.cnblogs.com/softidea/p/5991897.html)

在Spring Boot中使用Spring Security实现权限控制 : [http://blog.csdn.net/u012702547/article/details/54319508](http://blog.csdn.net/u012702547/article/details/54319508)

Test26-Security : [https://github.com/lenve/JavaEETest/tree/master/Test26-Security](https://github.com/lenve/JavaEETest/tree/master/Test26-Security)