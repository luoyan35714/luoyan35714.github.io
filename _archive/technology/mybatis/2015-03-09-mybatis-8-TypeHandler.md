---
layout: post
title:  mybatis-系列教程(八)-特殊类型转换处理（TypeHandler）
date:   2015-03-09 17:44:01 +0800
category : 技术文档
tag : mybatis
---

* content
{:toc}


Typehandler是什么
===========================
Typehandler是作为在表字段映射过程中的Converter处理器。

数据库String到Java模型Boolean对象的转换实现
===========================

BooleanTypeHandler.java
---------------------------------

{% highlight java %}
package com.freud.test.handler;

import java.sql.CallableStatement;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

import org.apache.ibatis.type.JdbcType;
import org.apache.ibatis.type.TypeHandler;

public class BooleanTypeHandler implements TypeHandler {

    @Override
    public Boolean getResult(CallableStatement cstat, int index)
            throws SQLException {
        String str = cstat.getString(index);
        try {
            Boolean ret = Boolean.valueOf(str);
            return ret;
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    @Override
    public Boolean getResult(ResultSet rs, String columnName)
            throws SQLException {
        String str = rs.getString(columnName);
        try {
            Boolean ret = Boolean.valueOf(str);
            return ret;
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    @Override
    public void setParameter(PreparedStatement pstmt, int index, Object value,
            JdbcType jdbcType) throws SQLException {
        Boolean boolValue = (Boolean) value;
        pstmt.setBoolean(index, boolValue);
    }
}
{% endhighlight %}

> 实现org.apache.ibatis.type.TypeHandler接口，并实现其中的三个Abstract方法，两个Get方法指的是从数据库流中取出数据，一个set指的是将数据设置进数据库操作流。

mapper.xml
---------------------------------

{% highlight xml %}
<resultMap id="user"
    type="com.freud.test.beans.User">
    <id property="id" jdbcType="INTEGER" column="ID" />
    <result property="isEmployed" jdbcType="VARCHAR" column="IS_EMPLOYED" typeHandler="com.freud.test.handler.BooleanTypeHandler"/>
</resultMap>
{% endhighlight %}

User.java
---------------------------------

{% highlight java %}
package com.freud.test.beans;

public class User {

    private int id;
    private Boolean isEmployed;

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public Boolean getIsEmployed() {
        return isEmployed;
    }

    public void setIsEmployed(Boolean isEmployed) {
        this.isEmployed = isEmployed;
    }
}
{% endhighlight %}

