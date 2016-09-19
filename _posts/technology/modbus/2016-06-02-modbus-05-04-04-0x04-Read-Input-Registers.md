---
layout: post
title:  Modbus-学习笔记(八)-0x04 Read Input Registers(读输入寄存器)
date:   2016-06-20 23:42:30 +0800
category : 技术文档
tag : Modbus
---

* content
{:toc}


模拟器Server设置
=============================

Connection -> Connect
-----------------------------

![connect-setup](/images/blog/modbus/modbus-05-04-Read-Input-Registers/06-modbus-slave-connect-setup.png)

Setup -> Slave Definition
-----------------------------

![setup-definition](/images/blog/modbus/modbus-05-04-Read-Input-Registers/07-modbus-slave-setup-definition.png)

双击00000列第一行
-----------------------------

![setup-value](/images/blog/modbus/modbus-05-04-Read-Input-Registers/08-modbus-slave-setup-value.png)


模拟器Client设置
=============================

Connection -> Connection Setup
-----------------------------

![connection-setup](/images/blog/modbus/modbus-05-04-Read-Input-Registers/09-modbus-pool-connection-setup.png)

Setup -> Read/Write Definition
-----------------------------

![read-write-definition](/images/blog/modbus/modbus-05-04-Read-Input-Registers/10-modbus-pool-read-write-definition.png)

代码实现
=============================

Test0X04.java
-----------------------------

{% highlight java %}
package com.freud;

import java.io.InputStream;
import java.io.OutputStream;
import java.net.Socket;

/**
 * 
 * @author Freud Kang
 *
 */
public class Test0X04 {

	public static void main(String[] args) throws Exception {

		Socket socket = null;

		OutputStream os = null;
		InputStream is = null;

		try {
			socket = new Socket("localhost", 502);
			os = socket.getOutputStream();
			is = socket.getInputStream();
			byte[] request = new byte[] { 0X00, 0X01, 0X00, 0X00, 0X00, 0X06, 0X01, 0X04, 0X00,
					0X00, 0X00, 0X02 };
			System.out.println("Request  : " + bytes2HexString(request));
			os.write(request);
			Thread.sleep(100);
			byte[] buffer = new byte[is.available()];
			is.read(buffer);
			String result = bytes2HexString(buffer);
			System.out.println("response : " + result);
		} finally {
			if (is != null) {
				is.close();
			}
			if (os != null) {
				os.flush();
				os.close();
			}
			if (socket != null) {
				socket.close();
			}
		}
	}

	public static String bytes2HexString(byte[] src) {
		StringBuilder stringBuilder = new StringBuilder();
		if (src == null || src.length <= 0) {
			return null;
		}
		for (int i = 0; i < src.length; i++) {
			int v = src[i] & 0xFF;
			String hv = Integer.toHexString(v).toUpperCase();
			if (hv.length() < 2) {
				stringBuilder.append(0);
			}
			stringBuilder.append(hv);
		}
		return stringBuilder.toString();
	}
}

/**
 * Request  : 000100000006010400000002
 * response : 000100000007010404000C0000
 */
{% endhighlight %}

Request解析
-----------------------------

`0X00, 0X01, 0X00, 0X00, 0X00, 0X06, 0X01, 0X04, 0X00, 0X00, 0X00, 0X02`解析为16进制为`000100000006010400000002`

| 传输标志(2) | 协议标志(2) | 长度(2) | 单元标志(1) | 功能码(1) | 起始地址(2) | 寄存器个数(2) |
| 0001        | 0000        | 0006    | 01          | 04        | 0000        | 0002          |

Response解析
-----------------------------

返回字节数组解析为16进制为`000100000007010404000C0000`

| 传输标志(2) | 协议标志(2) | 长度(2) | 单元标志(1) | 功能码(1) | 数组个数(1) | 寄存器值(4) |
| 0001        | 0000        | 0007    | 01          | 04        | 04          | 000C0000    |

其中数组个数`04`代表长度表示其后有4个字节。寄存器的值默认为short类型，即占用2个byte，所以取回2个寄存器值分别是`000C`,`0000`，由16进制转换为10进制为`12`,`0`


官方文档
=============================

Request
-----------------------------

![Request](/images/blog/modbus/modbus-05-04-Read-Input-Registers/01_Request.png)

Response
-----------------------------

![Response](/images/blog/modbus/modbus-05-04-Read-Input-Registers/02_Response.png)

> *N = Quantity of Input Registers

Error
-----------------------------

![Error](/images/blog/modbus/modbus-05-04-Read-Input-Registers/03_Error.png)

Example
-----------------------------

![Example](/images/blog/modbus/modbus-05-04-Read-Input-Registers/04_Example_1.png)
![Example](/images/blog/modbus/modbus-05-04-Read-Input-Registers/04_Example_2.png)

State Diagram
-----------------------------

![State Diagram](/images/blog/modbus/modbus-05-04-Read-Input-Registers/05_State_Diagram.png)


<br>
<br>

参考资料
================================

Modbus官方文档:《Modbus_Application_Protocol_V1_1b3》

Modbus RTU和ASCII 协议解析 : [http://www.modbustools.com/modbus.html](http://www.modbustools.com/modbus.html)
