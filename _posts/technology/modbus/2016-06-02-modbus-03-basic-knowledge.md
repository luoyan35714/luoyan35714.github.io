---
layout: post
title:  Modbus-学习笔记(三)-基础知识
date:   2016-06-02 17:47:01 +0800
category : 技术文档
tag : Modbus
---

* content
{:toc}


Modbus功能码
====================

+ 功能码，Modbus功能码有三种，第一种是公共功能码(Public Function Codes),第二种是 用户自定义功能码(User-Defined Function Codes),第三种是保留功能码(Reserved Function Codes), 每部分的定义如下

![/images/blog/modbus/modbus-03-basic-knowledge/01.png](/images/blog/modbus/modbus-03-basic-knowledge/01.png)

+ 其中公共功能码如下：

![/images/blog/modbus/modbus-03-basic-knowledge/02.png](/images/blog/modbus/modbus-03-basic-knowledge/02.png)
 
标准的modbus协议组成(RTU和ASCII)
====================

<image src="/images/blog/modbus/modbus-03-basic-knowledge/03.png" alt="/images/blog/modbus/modbus-03-basic-knowledge/03.png" style="width:757px"/>

Modbus TCP/IP协议组成
====================

<image src="/images/blog/modbus/modbus-03-basic-knowledge/04.png" alt="/images/blog/modbus/modbus-03-basic-knowledge/04.png" style="width:757px"/>

MBAP头消息解析
====================

![/images/blog/modbus/modbus-03-basic-knowledge/05.png](/images/blog/modbus/modbus-03-basic-knowledge/05.png)

Modbus正常解析流程
====================

<image src="/images/blog/modbus/modbus-03-basic-knowledge/06.png" alt="/images/blog/modbus/modbus-03-basic-knowledge/06.png" style="width:757px"/>

+ The header is 7 bytes long: 
	* Transaction Identifier - It is used for transaction pairing, the MODBUS server copies in the response the transaction identifier of the request. 
	* Protocol Identifier – It is used for intra-system multiplexing. The MODBUS protocol is identified by the value 0. 
	* Length - The length field is a byte count of the following fields, including the Unit Identifier and data fields. 
	* Unit Identifier – This field is used for intra-system routing purpose. It is typically used to communicate to a MODBUS+ or a MODBUS serial line slave through a gateway between an Ethernet TCP-IP network and a MODBUS serial line. This field is set by the MODBUS Client in the request and must be returned with the same value in the response by the server. 
	* All MODBUS/TCP ADU are sent via TCP to registered port 502. 

> Remark : the different fields are encoded in Big-endian.

Modbus异常解析流程
====================

<image src="/images/blog/modbus/modbus-03-basic-knowledge/07.png" alt="/images/blog/modbus/modbus-03-basic-knowledge/07.png" style="width:757px"/>

缩写
====================

![/images/blog/modbus/modbus-03-basic-knowledge/08.png](/images/blog/modbus/modbus-03-basic-knowledge/08.png)

错误码
====================

![/images/blog/modbus/modbus-03-basic-knowledge/09.png](/images/blog/modbus/modbus-03-basic-knowledge/09.png) 

<br>
<br>

参考资料
====================

Modbus官方文档:《Modbus_Application_Protocol_V1_1b3》
