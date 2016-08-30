---
layout: post
title:  Modbus-学习笔记(十一)-0x0F Write Multiple Coils(写多线圈寄存器)
date:   2016-06-20 23:45:30 +0800
category : 技术文档
tag : Modbus
---

* content
{:toc}


+ Request
![Request](/images/blog/modbus/modbus-05-15-Write-Multiple-Coils/01_Request.png)

> *N = Quantity of Outputs / 8, if the remainder is different of 0  N = N+1

+ Response
![Response](/images/blog/modbus/modbus-05-15-Write-Multiple-Coils/02_Response.png)

+ Error
![Error](/images/blog/modbus/modbus-05-15-Write-Multiple-Coils/03_Error.png)

+ Example
![Example](/images/blog/modbus/modbus-05-15-Write-Multiple-Coils/04_Example.png)

+ State Diagram
![State Diagram](/images/blog/modbus/modbus-05-15-Write-Multiple-Coils/05_State_Diagram.png)


<br>
<br>

参考资料
================================

Modbus官方文档:《Modbus_Application_Protocol_V1_1b3》
