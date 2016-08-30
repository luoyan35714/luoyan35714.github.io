---
layout: post
title:  mybatis-系列教程(七)-逻辑分页与物理分页（Pagination）
date:   2015-03-06 14:15:01 +0800
category : 技术文档
tag : mybatis
---

* content
{:toc}


介绍
=================================

> `逻辑分页` : 逻辑分页指的是将数据库中所有数据全部取出，然后通过Java代码控制分页逻辑。
<br />
> `物理分页` : 物理分页指的是在SQL查询过程中实现分页，依托与不同的数据库厂商，实现也会不同。

正是由于不同的数据库厂商所提供的分页不同，例如ORACLE是子查询实现，MySQL是limit语句实现，所以在Mybatis中，默认的实现是基于逻辑分页的。但是Mybatis支持拦截器(Interceptor),所以，我们可以根据不同的数据库，定制自己的数据库物理分页逻辑。

逻辑分页
=================================

逻辑分页的实现很简单，只需要在查询的Mapper层添加RowBound对象即可，举例

mapper的Java文件
---------------------------------

{% highlight java %}
List<LogType> getLogsBySortASC(RowBounds rb);
{% endhighlight %}

mapper的xml文件
---------------------------------

{% highlight xml %}
<resultMap id="log"
	type="com.freud.test.log.beans.LogType">
	<result property="id" jdbcType="INTEGER" column="ID" />
	<result property="username" jdbcType="VARCHAR" column="OPERATOR" />
	<result property="operateObject" jdbcType="VARCHAR" column="OPERATE_OBJECT" />
	<result property="operateDesc" jdbcType="VARCHAR" column="OPERATE_DESC" />
	<result property="operateTime" jdbcType="VARCHAR" column="OPERATE_TIME" />
	<result property="operateIp" jdbcType="VARCHAR" column="OPERATE_IP" />
</resultMap>
<select id="getLogsBySortASC" resultMap="log">
	SELECT
		ID,
		OPERATOR,
		OPERATE_OBJECT,
		OPERATE_DESC,
		OPERATE_TIME,
		OPERATE_IP
	FROM SYS_LOG
	ORDER BY OPERATE_TIME ASC
</select>
{% endhighlight %}

分页调用
---------------------------------

{% highlight java %}
//RowBounds第一个参数表示起始行，第二个表示取多少行
loggerMapper.getLogsBySortASC(new RowBounds(0,10));
{% endhighlight %}

物理分页
=================================

在Spring的配置文件中修改sqlSessionFactory，添加configLocation
{% highlight xml %}
<bean id="sqlSessionFactory" class="org.mybatis.spring.SqlSessionFactoryBean">
	<property name="dataSource" ref="dataSource" />
	<property name="configLocation"
		value="classpath:conf/mybatis/mybatis-configuration.xml" />
</bean>
{% endhighlight %}

mybatis-configuration.xml
---------------------------------

{% highlight xml %}
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE configuration PUBLIC "-//mybatis.org//DTD Config 3.0//EN" "http://mybatis.org/dtd/mybatis-3-config.dtd">
<configuration>
	<plugins>
		<plugin interceptor="com.freud.test.mybatis.plugin.OffsetLimitInterceptor">
			<property name="dialectClass" value="com.freud.test.mybatis.dialect.MySQLDialect"/>
		</plugin>
	</plugins>
</configuration>
{% endhighlight %}

OffsetLimitInterceptor.java
---------------------------------

{% highlight java %}
package com.freud.test.mybatis.plugin;

import java.lang.reflect.Field;
import java.util.Properties;

import org.apache.ibatis.executor.Executor;
import org.apache.ibatis.mapping.BoundSql;
import org.apache.ibatis.mapping.MappedStatement;
import org.apache.ibatis.mapping.MappedStatement.Builder;
import org.apache.ibatis.mapping.SqlSource;
import org.apache.ibatis.plugin.Interceptor;
import org.apache.ibatis.plugin.Intercepts;
import org.apache.ibatis.plugin.Invocation;
import org.apache.ibatis.plugin.Plugin;
import org.apache.ibatis.plugin.Signature;
import org.apache.ibatis.reflection.MetaObject;
import org.apache.ibatis.session.ResultHandler;
import org.apache.ibatis.session.RowBounds;

import com.freud.test.mybatis.dialect.Dialect;
import com.freud.test.mybatis.util;

/**
 * 
 * @ClassName: OffsetLimitInterceptor <br>
 * @Description: Mybatis 中拦截器的物理分页逻辑具体实现<br>
 * 
 * @author Freud
 */
@Intercepts({@Signature(type = Executor.class, method = "query", args = {MappedStatement.class, Object.class,
    RowBounds.class, ResultHandler.class})})
public class OffsetLimitInterceptor implements Interceptor
{
    static int MAPPED_STATEMENT_INDEX = 0;
    
    static int PARAMETER_INDEX = 1;
    
    static int ROWBOUNDS_INDEX = 2;
    
    static int RESULT_HANDLER_INDEX = 3;
    
    Dialect dialect;
    
    public Object intercept(Invocation invocation)
        throws Throwable
    {
        processIntercept(invocation.getArgs());
        return invocation.proceed();
    }
    
    void processIntercept(final Object[] queryArgs)
    {
        // queryArgs = query(MappedStatement ms, Object parameter, RowBounds rowBounds, ResultHandler resultHandler)
        MappedStatement ms = (MappedStatement)queryArgs[MAPPED_STATEMENT_INDEX];
        Object parameter = queryArgs[PARAMETER_INDEX];
        final RowBounds rowBounds = (RowBounds)queryArgs[ROWBOUNDS_INDEX];
        int offset = rowBounds.getOffset();
        int limit = rowBounds.getLimit();
        
        if (dialect.supportsLimit() && (offset != RowBounds.NO_ROW_OFFSET || limit != RowBounds.NO_ROW_LIMIT))
        {
            BoundSql boundSql = ms.getBoundSql(parameter);
            String sql = boundSql.getSql().trim();
            if (dialect.supportsLimitOffset())
            {
                sql = dialect.getLimitString(sql, offset, limit);
                offset = RowBounds.NO_ROW_OFFSET;
            }
            else
            {
                sql = dialect.getLimitString(sql, 0, limit);
            }
            limit = RowBounds.NO_ROW_LIMIT;
            
            queryArgs[ROWBOUNDS_INDEX] = new RowBounds(offset, limit);
            BoundSql newBoundSql =
                new BoundSql(ms.getConfiguration(), sql, boundSql.getParameterMappings(), boundSql.getParameterObject());
            if (metaParamsField != null) {
                MetaObject mo = (MetaObject) ReflectionUtils.getFieldValue(boundSql, "metaParameters");
                ReflectionUtils.setFieldValue(newBoundSql, "metaParameters", mo);
            }
            MappedStatement newMs = copyFromMappedStatement(ms, new BoundSqlSqlSource(newBoundSql));
            queryArgs[MAPPED_STATEMENT_INDEX] = newMs;
        }
    }
    
    // see: MapperBuilderAssistant
    private MappedStatement copyFromMappedStatement(MappedStatement ms, SqlSource newSqlSource)
    {
        Builder builder =
            new MappedStatement.Builder(ms.getConfiguration(), ms.getId(), newSqlSource, ms.getSqlCommandType());
        
        builder.resource(ms.getResource());
        builder.fetchSize(ms.getFetchSize());
        builder.statementType(ms.getStatementType());
        builder.keyGenerator(ms.getKeyGenerator());
        builder.keyProperty(ms.getKeyProperty());
        
        // setStatementTimeout()
        builder.timeout(ms.getTimeout());
        
        // setStatementResultMap()
        builder.parameterMap(ms.getParameterMap());
        
        // setStatementResultMap()
        builder.resultMaps(ms.getResultMaps());
        builder.resultSetType(ms.getResultSetType());
        
        // setStatementCache()
        builder.cache(ms.getCache());
        builder.flushCacheRequired(ms.isFlushCacheRequired());
        builder.useCache(ms.isUseCache());
        
        return builder.build();
    }
    
    public Object plugin(Object target)
    {
        return Plugin.wrap(target, this);
    }
    
    public void setProperties(Properties properties)
    {
        String dialectClass = properties.get("dialectClass").toString();
        try
        {
            dialect = (Dialect)Class.forName(dialectClass).newInstance();
        }
        catch (Exception e)
        {
            throw new RuntimeException("cannot create dialect instance by dialectClass:" + dialectClass, e);
        }
    }
    
    public static class BoundSqlSqlSource implements SqlSource
    {
        BoundSql boundSql;
        
        public BoundSqlSqlSource(BoundSql boundSql)
        {
            this.boundSql = boundSql;
        }
        
        public BoundSql getBoundSql(Object parameterObject)
        {
            return boundSql;
        }
    }
    
}
{% endhighlight %}

Dialect.java
---------------------------------

{% highlight java %}
package com.freud.test.mybatis.dialect;

/**
 * 
 * @ClassName: Dialect <br>
 * @Description: 类似hibernate的Dialect,但只精简出分页部分 <br>
 * 
 * @author Freud
 */
public class Dialect
{
    
    public boolean supportsLimit()
    {
        return false;
    }
    
    public boolean supportsLimitOffset()
    {
        return supportsLimit();
    }
    
    /**
     * 将sql变成分页sql语句,直接使用offset,limit的值作为占位符.</br> 源代码为:
     * getLimitString(sql,offset,String.valueOf(offset),limit,String.valueOf(limit))
     */
    public String getLimitString(String sql, int offset, int limit)
    {
        return getLimitString(sql, offset, Integer.toString(offset), limit, Integer.toString(limit));
    }
    
    /**
     * 将sql变成分页sql语句,提供将offset及limit使用占位符(placeholder)替换.
     * 
     * <pre>
     * 如mysql
     * dialect.getLimitString("select * from user", 12, ":offset",0,":limit") 将返回
     * select * from user limit :offset,:limit
     * </pre>
     * 
     * @return 包含占位符的分页sql
     */
    public String getLimitString(String sql, int offset, String offsetPlaceholder, int limit, String limitPlaceholder)
    {
        throw new UnsupportedOperationException("paged queries not supported");
    }
    
}
{% endhighlight %}

ReflectionUtils.java
---------------------------------

{% highlight java %}
package com.freud.test.mybatis.util;

import java.lang.reflect.Field;
import java.lang.reflect.Modifier;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.util.Assert;

/**
 * @ClassName: ReflectionUtils <br>
 * @Description: 反射工具类 <br>
 * 
 * @author Freud
 */
public class ReflectionUtils {

    private static Logger logger = LoggerFactory
            .getLogger(ReflectionUtils.class);

    /**
     * 循环向上转型, 获取对象的DeclaredField.
     * 
     * 如向上转型到Object仍无法找到, 返回null.
     */
    public static Field getDeclaredField(final Object object,
            final String fieldName) {
        Assert.notNull(object, "object不能为空");
        Assert.hasText(fieldName, "fieldName");
        for (Class<?> superClass = object.getClass(); superClass != Object.class; superClass = superClass
                .getSuperclass()) {
            try {
                return superClass.getDeclaredField(fieldName);
            } catch (final NoSuchFieldException e) {
                // Field不在当前类定义,继续向上转型
            }
        }
        return null;
    }

    /**
     * 直接读取对象属性值, 无视private/protected修饰符, 不经过getter函数.
     */
    public static Object getFieldValue(final Object object,
            final String fieldName) {
        final Field field = getDeclaredField(object, fieldName);

        if (field == null) {
            throw new IllegalArgumentException("Could not find field ["
                    + fieldName + "] on target [" + object + "]");
        }

        makeAccessible(field);

        Object result = null;
        try {
            result = field.get(object);
        } catch (final IllegalAccessException e) {
            logger.error("不可能抛出的异常{}", e.getMessage());
        }
        return result;
    }

    /**
     * 强行设置Field可访问.
     */
    protected static void makeAccessible(final Field field) {
        if (!Modifier.isPublic(field.getModifiers())
                || !Modifier.isPublic(field.getDeclaringClass().getModifiers())) {
            field.setAccessible(true);
        }
    }

    /**
     * 直接设置对象属性值, 无视private/protected修饰符, 不经过setter函数.
     */
    public static void setFieldValue(final Object object,
            final String fieldName, final Object value) {
        final Field field = getDeclaredField(object, fieldName);

        if (field == null) {
            throw new IllegalArgumentException("Could not find field ["
                    + fieldName + "] on target [" + object + "]");
        }

        makeAccessible(field);

        try {
            field.set(object, value);
        } catch (final IllegalAccessException e) {
            logger.error("不可能抛出的异常:{}", e.getMessage());
        }
    }
}
{% endhighlight %}

MySQLDialect.java
---------------------------------

{% highlight java %}
package com.freud.test.mybatis.dialect;

/**
 * 
 * @ClassName: MySQLDialect <br>
 * @Description: MySql的分页方言实现 <br>
 * 
 * @author Freud
 */
public class MySQLDialect extends Dialect
{
    
    public boolean supportsLimitOffset()
    {
        return true;
    }
    
    public boolean supportsLimit()
    {
        return true;
    }
    
    public String getLimitString(String sql, int offset, String offsetPlaceholder, int limit, String limitPlaceholder)
    {
        if (offset > 0)
        {
            return sql + " limit " + offsetPlaceholder + "," + limitPlaceholder;
        }
        else
        {
            return sql + " limit " + limitPlaceholder;
        }
    }
    
}
{% endhighlight %}

OracleDialect.java
---------------------------------

{% highlight java %}
package com.freud.test.mybatis.dialect;

/**
 * 
 * @ClassName: OracleDialect <br>
 * @Description: Oracle的分页方言实现 <br>
 * 
 * @author Freud
 */
public class OracleDialect extends Dialect
{
    
    public boolean supportsLimit()
    {
        return true;
    }
    
    public boolean supportsLimitOffset()
    {
        return true;
    }
    
    public String getLimitString(String sql, int offset, String offsetPlaceholder, int limit, String limitPlaceholder)
    {
        sql = sql.trim();
        boolean isForUpdate = false;
        if (sql.toLowerCase().endsWith(" for update"))
        {
            sql = sql.substring(0, sql.length() - 11);
            isForUpdate = true;
        }
        
        StringBuffer pagingSelect = new StringBuffer(sql.length() + 100);
        if (offset > 0)
        {
            pagingSelect.append("select * from ( select row_.*, rownum rownum_ from ( ");
        }
        else
        {
            pagingSelect.append("select * from ( ");
        }
        pagingSelect.append(sql);
        if (offset > 0)
        {
            // int end = offset+limit;
            String endString = offsetPlaceholder + "+" + limitPlaceholder;
            pagingSelect.append(" ) row_ ) where rownum_ <= " + endString + " and rownum_ > " + offsetPlaceholder);
        }
        else
        {
            pagingSelect.append(" ) where rownum <= " + limitPlaceholder);
        }
        
        if (isForUpdate)
        {
            pagingSelect.append(" for update");
        }
        
        return pagingSelect.toString();
    }
    
}
{% endhighlight %}

> 调用逻辑同逻辑分页的调用

<br/>
<br/>
