---
layout: post
title:  Spring Boot(十八) - 数据访问
date:   2017-07-06 16:01:00 +0800
categories: Spring-Boot
tag: 教程
---

* content
{:toc}


> 本文转自[http://docs.spring.io/spring-boot/docs/1.5.4.RELEASE/reference/htmlsingle/#howto-data-access](http://docs.spring.io/spring-boot/docs/1.5.4.RELEASE/reference/htmlsingle/#howto-data-access)


配置数据源
==================

自定义 `DataSource` 类型的 `@Bean` 可以覆盖默认设置，

{% highlight java %}
@Bean
@ConfigurationProperties(prefix="app.datasource")
public DataSource dataSource() {
    return new FancyDataSource();
}
{% endhighlight %}

{% highlight text %}
app.datasource.url=jdbc:h2:mem:mydb
app.datasource.username=sa
app.datasource.pool-size=30
{% endhighlight %}

Spring Boot也提供了一个工具类 `DataSourceBuilder` 用来创建标准的数据源。如果需要重用 `DataSourceProperties` 的配置，可以用它初始化一个 `DataSourceBuilder` ：

{% highlight java %}
@Bean
@ConfigurationProperties("app.datasource")
public DataSource dataSource() {
    return DataSourceBuilder.create().build();
}
{% endhighlight %}

在此场景中，保留了通过Spring Boot暴露的标准属性，通过添加 `@ConfigurationProperties` ，可以暴露在相应的命命名空间暴露其他特定实现的配置，具体详情可以参考[DataSourceAutoConfiguration](https://github.com/spring-projects/spring-boot/blob/v1.5.4.RELEASE/spring-boot-autoconfigure/src/main/java/org/springframework/boot/autoconfigure/jdbc/DataSourceAutoConfiguration.java)


配置两个数据源
==================

创建多个数据源和创建一个工作都是一样的，如果使用JDBC或JPA的默认自动配置，需要将其中一个设置为 `@Primary` （然后它就能被任何 @Autowired 注入获取）。

{% highlight java %}
@Bean
@Primary
@ConfigurationProperties("app.datasource.foo")
public DataSourceProperties fooDataSourceProperties() {
    return new DataSourceProperties();
}

@Bean
@Primary
@ConfigurationProperties("app.datasource.foo")
public DataSource fooDataSource() {
    return fooDataSourceProperties().initializeDataSourceBuilder().build();
}

@Bean
@ConfigurationProperties("app.datasource.bar")
public DataSourceProperties barDataSourceProperties() {
    return new DataSourceProperties();
}

@Bean
@ConfigurationProperties("app.datasource.bar")
public DataSource barDataSource() {
    return barDataSourceProperties().initializeDataSourceBuilder().build();
}
{% endhighlight %}

{% highlight text %}
app.datasource.foo.type=com.zaxxer.hikari.HikariDataSource
app.datasource.foo.maximum-pool-size=30

app.datasource.bar.url=jdbc:mysql://localhost/test
app.datasource.bar.username=dbuser
app.datasource.bar.password=dbpass
app.datasource.bar.max-total=30
{% endhighlight %}


使用Spring Data仓库
==================

Spring Data可以为 `@Repository` 接口创建各种风格的实现。Spring Boot会为处理所有事情，只要那些 `@Repositories` 接口跟 `@EnableAutoConfiguration` 类处于相同的包（或子包）。

对于很多应用来说，需要做的就是将正确的Spring Data依赖添加到classpath下（JPA对应 `spring-boot-starter-data-jpa` ，Mongodb对应 `spring-bootstarter-data-mongodb` ），创建一些repository接口来处理 @Entity 对象，相应示例可参考[JPA sample](https://github.com/spring-projects/spring-boot/tree/v1.5.4.RELEASE/spring-boot-samples/spring-boot-sample-data-jpa) 或 [Mongodb sample](https://github.com/spring-projects/spring-boot/tree/v1.5.4.RELEASE/spring-boot-samples/spring-boot-sample-data-mongodb)。

Spring Boot会基于它找到的 `@EnableAutoConfiguration` 来尝试猜测 `@Repository` 定义的位置。想要获取更多控制，可以使用 `@EnableJpaRepositories` 注解（来自Spring Data JPA）。


从Spring配置分离 @Entity 定义
==================

Spring Boot会基于它找到的 `@EnableAutoConfiguration` 来尝试猜测 `@Entity` 定义的位置，想要获取更多控制可以使用 `@EntityScan` 注解，比如：

{% highlight java %}
@Configuration
@EnableAutoConfiguration
@EntityScan(basePackageClasses=City.class)
public class Application {
    //...
}
{% endhighlight %}


配置JPA属性
==================

Spring Data JPA已经提供了一些独立的配置选项（比如，针对SQL日志），并且Spring Boot会暴露它们，针对hibernate的外部配置属性也更多些，其中大部分会通过上下文自动配置好，所以不用手动设置。

`spring.jpa.hibernate.ddl-auto` 配置是个特殊情况，它的默认设置取决于是否使用内嵌数据库（是则默认值为 `create-drop` ，否则为 `none` ）。

关于方言的使用也会基于当前的`DataSource`自动配置并加载进去，可以通过设置`spring.jpa.database` 来看到直观的启动检查。(The dialect to use is also automatically detected based on the current DataSource but you can set spring.jpa.database yourself if you want to be explicit and bypass that check on startup.)

{% highlight text %}
spring.jpa.hibernate.naming.physical-strategy=com.example.MyPhysicalNamingStrategy
spring.jpa.show-sql=true
{% endhighlight %}

另外，在本地EntityManagerFactory创建的时候，所有的`spring.jpa.properties.*`下的属性都会作为普通JPA属性被加载。


配置`Hibernate`命名策略
==================

Spring Boot provides a consistent naming strategy regardless of the Hibernate generation that you are using. If you are using Hibernate 4, you can customize it using spring.jpa.hibernate.naming.strategy; Hibernate 5 defines a Physical and Implicit naming strategies.

Spring Boot configures SpringPhysicalNamingStrategy by default. This implementation provides the same table structure as Hibernate 4: all dots are replaced by underscores and camel cases are replaced by underscores as well. By default, all table names are generated in lower case but it is possible to override that flag if your schema requires it.

Concretely, a TelephoneNumber entity will be mapped to the telephone_number table.

如果更愿意使用默认的Hibernate 5来代替，就设置如下属性:

{% highlight text %}
spring.jpa.hibernate.naming.physical-strategy=org.hibernate.boot.model.naming.PhysicalNamingStrategyStandardImpl
{% endhighlight %}

查看 [HibernateJpaAutoConfiguration](https://github.com/spring-projects/spring-boot/blob/v1.5.4.RELEASE/spring-boot-autoconfigure/src/main/java/org/springframework/boot/autoconfigure/orm/jpa/HibernateJpaAutoConfiguration.java) and [JpaBaseConfiguration](https://github.com/spring-projects/spring-boot/blob/v1.5.4.RELEASE/spring-boot-autoconfigure/src/main/java/org/springframework/boot/autoconfigure/orm/jpa/JpaBaseConfiguration.java) 获取更多细节.


使用自定义EntityManagerFactory
==================

为了完全控制 `EntityManagerFactory` 的配置，需要添加一个名为 `entityManagerFactory` 的 `@Bean` ，Spring Boot自动配置会根据是否存在该类型的bean来关闭它的实体管理器（entity manager）。


使用两个EntityManagers
==================

即使默认的 `EntityManagerFactory` 工作的很好，也需要定义一个新的 `EntityManagerFactory` ，因为一旦出现第二个该类型的bean，默认的将会被关闭。为了轻松的实现该操作，可以使用Spring Boot提供的 `EntityManagerBuilder` ，或者如果你喜欢的话可以直接使用来自Spring ORM的 `LocalContainerEntityManagerFactoryBean` 。

{% highlight java %}
// add two data sources configured as above

@Bean
public LocalContainerEntityManagerFactoryBean customerEntityManagerFactory(
        EntityManagerFactoryBuilder builder) {
    return builder
            .dataSource(customerDataSource())
            .packages(Customer.class)
            .persistenceUnit("customers")
            .build();
}

@Bean
public LocalContainerEntityManagerFactoryBean orderEntityManagerFactory(
        EntityManagerFactoryBuilder builder) {
    return builder
            .dataSource(orderDataSource())
            .packages(Order.class)
            .persistenceUnit("orders")
            .build();
}
{% endhighlight %}

上面的配置靠自己基本可以运行，想要完成作品还需要为两个 `EntityManagers` 配置 `TransactionManagers` 。其中的一个会被Spring Boot默认的 `JpaTransactionManager` 获取，如果将它标记为 `@Primary` 。另一个需要显式注入到一个新实例。或你可以使用一个JTA事物管理器生成它两个。如果使用Spring Data，你需要相应地配置 `@EnableJpaRepositories` ：

{% highlight java %}
@Configuration
@EnableJpaRepositories(basePackageClasses = Customer.class, entityManagerFactoryRef = "customerEntityManagerFactory")
public class CustomerConfiguration {
    ...
}

@Configuration
@EnableJpaRepositories(basePackageClasses = Order.class, entityManagerFactoryRef = "orderEntityManagerFactory")
public class OrderConfiguration {
    ...
}
{% endhighlight %}


使用普通的persistence.xml
==================

Spring不要求使用XML配置JPA提供者（provider），并且Spring Boot假定想要充分利用该特性。如果倾向于使用 `persistence.xml` ，那需要定义自己的id为 `entityManagerFactory` 的 `LocalEntityManagerFactoryBean` 类型的 `@Bean` ，并在那设置持久化单元的名称，默认设置可查看[JpaBaseConfiguration](https://github.com/spring-projects/spring-boot/blob/master/spring-boot-autoconfigure/src/main/java/org/springframework/boot/autoconfigure/orm/jpa/JpaBaseConfiguration.java)。


使用Spring Data JPA和Mongo仓库
==================

Spring Data JPA和Spring Data Mongo都能自动创建 `Repository` 实现。如果它们同时出现在classpath下，可能需要添加额外的配置来告诉Spring Boot想
要哪个（或两个）来创建仓库。最明确地方式是使用标准的Spring Data `@Enable*Repositories` ，然后告诉它 `Repository` 接口的位置（此处 `*` 即可以是Jpa，也可以是Mongo，或者两者都是）。

这里也有 `spring.data.*.repositories.enabled` 标志，可用来在外部配置中开启或关闭仓库的自动配置，这在想关闭Mongo仓库但仍使用自动配置
的 MongoTemplate 时非常有用。

相同的障碍和特性也存在于其他自动配置的Spring Data仓库类型（Elasticsearch, Solr），只需要改变对应注解的名称和标志。


将Spring Data仓库暴露为REST端点
==================

Spring Data REST能够将 `Repository` 的实现暴露为REST端点，只要该应用启用Spring MVC。Spring Boot暴露一系列来自 `spring.data.rest` 命名空间的有用属性来定制化[RepositoryRestConfiguration](http://docs.spring.io/spring-data/rest/docs/current/api/org/springframework/data/rest/core/config/RepositoryRestConfiguration.html)，可以使用 [RepositoryRestConfigurer](http://docs.spring.io/spring-data/rest/docs/current/api/org/springframework/data/rest/webmvc/config/RepositoryRestConfigurer.html) 提供其他定制。


配置JPA使用的组件
==================

如果想配置一个JPA使用的组件，需要确保该组件在JPA之前初始化。组件如果是Spring Boot自动配置的，Spring Boot会来进行处理。例如，Flyway是自动配置的，Hibernate依赖于Flyway，这样Hibernate有机会在使用数据库前对其进行初始化。

如果自己配置组件，可以使用 `EntityManagerFactoryDependsOnPostProcessor` 子类设置必要的依赖，例如，如果正使用Hibernate搜索，并将Elasticsearch作为它的索引管理器，这样任何 `EntityManagerFactory` beans必须设置为依赖 `elasticsearchClient` bean：

{% highlight java %}
/**
 * {@link EntityManagerFactoryDependsOnPostProcessor} that ensures that
 * {@link EntityManagerFactory} beans depend on the {@code elasticsearchClient} bean.
 */
@Configuration
static class ElasticsearchJpaDependencyConfiguration
        extends EntityManagerFactoryDependsOnPostProcessor {

    ElasticsearchJpaDependencyConfiguration() {
        super("elasticsearchClient");
    }

}
{% endhighlight %}


参考资料
==================

Spring Boot Reference Guide : [http://docs.spring.io/spring-boot/docs/current-SNAPSHOT/reference/htmlsingle/](http://docs.spring.io/spring-boot/docs/current-SNAPSHOT/reference/htmlsingle/)
