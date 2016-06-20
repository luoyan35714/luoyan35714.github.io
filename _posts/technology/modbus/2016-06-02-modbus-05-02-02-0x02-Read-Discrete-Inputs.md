---
layout: post
title:  Modbus-学习笔记(六)-0x02 Read Discrete Inputs(读取离散量输入)
date:   2016-06-02 17:50:01 +0800
category : 技术文档
tag : Modbus
---

Read Discrete Inputs(读取离散量输入)
============================

+ Request
![Request](/images/blog/modbus/modbus-05-02-read-discrete-inputs/01_Request.png)

+ Response
![Response](/images/blog/modbus/modbus-05-02-read-discrete-inputs/02_Response.png)

> *N = Quantity of Inputs / 8 if the remainder is different of 0  N = N+1

+ Error
![Error](/images/blog/modbus/modbus-05-02-read-discrete-inputs/03_Error.png)

+ Example
![Example](/images/blog/modbus/modbus-05-02-read-discrete-inputs/04_Example.png)

+ State Diagram
![State Diagram](/images/blog/modbus/modbus-05-02-read-discrete-inputs/05_State_Diagram.png)


<br>
<br>

参考资料
================================

Modbus官方文档:《Modbus_Application_Protocol_V1_1b3》
