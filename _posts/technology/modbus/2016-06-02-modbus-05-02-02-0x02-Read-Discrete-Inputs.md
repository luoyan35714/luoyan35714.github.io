---
layout: post
title:  Modbus-学习笔记(六)-0x02 Read Discrete Inputs(读取离散量输入)
date:   2016-06-02 17:50:01 +0800
category : 技术文档
tag : Modbus
---

* content
{:toc}

模拟器Server设置
=============================

Connection -> Connect
-----------------------------

![connect-setup](/images/blog/modbus/modbus-05-02-read-discrete-inputs/06-modbus-slave-connect-setup.png)

Setup -> Slave Definition
-----------------------------

![setup-definition](/images/blog/modbus/modbus-05-02-read-discrete-inputs/07-modbus-slave-setup-definition.png)

双击00000列第二行
-----------------------------

![setup-value](/images/blog/modbus/modbus-05-02-read-discrete-inputs/08-modbus-slave-setup-value.png)


模拟器Client设置
=============================

Connection -> Connection Setup
-----------------------------

![connection-setup](/images/blog/modbus/modbus-05-02-read-discrete-inputs/09-modbus-pool-connection-setup.png)

Setup -> Read/Write Definition
-----------------------------

![read-write-definition](/images/blog/modbus/modbus-05-02-read-discrete-inputs/10-modbus-pool-read-write-definition.png)

代码实现
=============================

Test0X02.java
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
public class Test0X02 {

	public static void main(String[] args) throws Exception {

		Socket socket = null;

		OutputStream os = null;
		InputStream is = null;

		try {
			socket = new Socket("localhost", 502);
			os = socket.getOutputStream();
			is = socket.getInputStream();
			byte[] request = new byte[] { 0X00, 0X01, 0X00, 0X00, 0X00, 0X06, 0X01, 0X02, 0X00,
					0X00, 0X00, 0X08 };
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
 * Request  : 000100000006010200000008
 * response : 00010000000401020102
 */
{% endhighlight %}

Request解析
-----------------------------

`0X00, 0X01, 0X00, 0X00, 0X00, 0X06, 0X01, 0X02, 0X00, 0X00, 0X00, 0X08`解析为16进制为`000100000006010200000008`

| 传输标志(2) | 协议标志(2) | 长度(2) | 单元标志(1) | 功能码(1) | 起始地址(2) | Quantity of Inputs(2) |
| 0001        | 0000        | 0006    | 01          | 02        | 0000        | 0008                  |

Response解析
-----------------------------

返回字节数组解析为16进制为`00010000000401020102`

| 传输标志(2) | 协议标志(2) | 长度(2) | 单元标志(1) | 功能码(1) | 数组个数(1) | Input Status(1) |
| 0001        | 0000        | 0004    | 01          | 02        | 01          | 02              |

其中数组个数`01`代表长度表示其后有1个字节。线圈状态`02`解析为2进制为`00000010`,分别代表线圈的对应状态

| 8 | 7 | 6 | 5 | 4 | 3 | 2 | 1 |
| 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 |


官方文档
=============================

Request
-----------------------------

![Request](/images/blog/modbus/modbus-05-02-read-discrete-inputs/01_Request.png)

Response
-----------------------------

![Response](/images/blog/modbus/modbus-05-02-read-discrete-inputs/02_Response.png)

> *N = Quantity of Inputs / 8 if the remainder is different of 0  N = N+1

Error
-----------------------------

![Error](/images/blog/modbus/modbus-05-02-read-discrete-inputs/03_Error.png)

Example
-----------------------------

![Example](/images/blog/modbus/modbus-05-02-read-discrete-inputs/04_Example.png)

State Diagram
-----------------------------

![State Diagram](/images/blog/modbus/modbus-05-02-read-discrete-inputs/05_State_Diagram.png)


<br>
<br>

参考资料
================================

Modbus官方文档:《Modbus_Application_Protocol_V1_1b3》

Modbus RTU和ASCII 协议解析 : [http://www.modbustools.com/modbus.html](http://www.modbustools.com/modbus.html)
