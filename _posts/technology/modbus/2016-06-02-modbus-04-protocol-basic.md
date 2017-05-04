---
layout: post
title:  Modbus-学习笔记(四)-协议基础讲解
date:   2016-06-02 17:48:01 +0800
category : 技术文档
tag : Modbus
---

* content
{:toc}


RTU协议报文格式
================================

<div class="container">
    <div class="row col-md-6 col-sm-6">
        <table class="table table-bordered table-hover">
            <thead>
                <tr>
                    <th></th>
                    <th colspan="4" text-align="center">ADU</th>
                </tr>
                <tr>
                    <th scope="row"></th>
                    <th></th>
                    <th colspan="2">PDU</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <th>序号</th>
                    <td>1</td>
                    <td>2</td>
                    <td>3</td>
                    <td>4</td>
                </tr>
                <tr>
                    <th>长度(byte)</th>
                    <td>1</td>
                    <td>1</td>
                    <td>*</td>
                    <td>2</td>
                </tr>
                <tr>
                    <th>构成</th>
                    <td>Additional address</td>
                    <td>Function code</td>
                    <td>Data</td>
                    <td>CRC Error check</td>
                </tr>
                <tr>
                    <th>中文</th>
                    <td>单元标志</td>
                    <td>功能码</td>
                    <td>数据</td>
                    <td>CRC校验位</td>
                </tr>
            </tbody>
        </table>
    </div>
</div>


TCP/IP协议报文格式
================================

<div class="container">
    <div class="row col-md-6 col-sm-6">
        <table class="table table-bordered table-hover">
            <thead>
                <tr>
                    <th></th>
                    <th colspan="6" text-align="center">ADU</th>
                </tr>
                <tr>
                    <th scope="row"></th>
                    <th colspan="4">MBAP</th>
                    <th colspan="2">PDU</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <th>序号</th>
                    <td>1</td>
                    <td>2</td>
                    <td>3</td>
                    <td>4</td>
                    <td>5</td>
                    <td>6</td>
                </tr>
                <tr>
                    <th>长度(byte)</th>
                    <td>2</td>
                    <td>2</td>
                    <td>2</td>
                    <td>1</td>
                    <td>1</td>
                    <td>*</td>
                </tr>
                <tr>
                    <th>构成</th>
                    <td>Transaction Identifier</td>
                    <td>Protocol Identifier</td>
                    <td>Length</td>
                    <td>Additional address</td>
                    <td>Function Code</td>
                    <td>Data</td>
                </tr>
                <tr>
                    <th>中文</th>
                    <td>传输标志</td>
                    <td>协议标志</td>
                    <td>长度</td>
                    <td>单元标志</td>
                    <td>功能码</td>
                    <td>数据</td>
                </tr>
            </tbody>
        </table>
    </div>
</div>


ASCII协议报文格式
================================

<div class="container">
    <div class="row col-md-6 col-sm-6">
        <table class="table table-bordered table-hover">
            <thead>
                <tr>
                    <th></th>
                    <th colspan="6" text-align="center">ADU</th>
                </tr>
                <tr>
                    <th scope="row"></th>
                    <th></th>
                    <th></th>
                    <th colspan="2">PDU</th>
                    <th></th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <th>序号</th>
                    <td>1</td>
                    <td>2</td>
                    <td>3</td>
                    <td>4</td>
                    <td>5</td>
                    <td>6</td>
                </tr>
                <tr>
                    <th>长度(byte)</th>
                    <td>1</td>
                    <td>2</td>
                    <td>2</td>
                    <td>*</td>
                    <td>2</td>
                    <td>2</td>
                </tr>
                <tr>
                    <th>构成</th>
                    <td>STX</td>
                    <td>Additional address</td>
                    <td>Function Code</td>
                    <td>Data</td>
                    <td>LRC</td>
                    <td>End</td>
                </tr>
                <tr>
                    <th>中文</th>
                    <td>起始字符(3AH)</td>
                    <td>单元标志</td>
                    <td>功能码</td>
                    <td>数据</td>
                    <td>LRC校验</td>
                    <td>结束字符, 高位=CR(0DH)低位=LF(0AH)</td>
                </tr>
            </tbody>
        </table>
    </div>
</div>


参考资料
================================

Modbus官方文档：《Modbus_Application_Protocol_V1_1b3》

Modbus asci通讯协定：[http://wenku.baidu.com/link?url=R7TE7D-qq4vwWrIuT_gI-01m4LL37jug63ZCVeGus1gWSyrpaQlc4hQs-MDgt6LbKwQon6HzjO9Z0cbMWruAcb3ZnnqR1rAUpruFISmN1hO](http://wenku.baidu.com/link?url=R7TE7D-qq4vwWrIuT_gI-01m4LL37jug63ZCVeGus1gWSyrpaQlc4hQs-MDgt6LbKwQon6HzjO9Z0cbMWruAcb3ZnnqR1rAUpruFISmN1hO)

MODBUS通讯协议-RTU：[http://wenku.baidu.com/link?url=VaDOEc8KpmsbJ5R6gvJfWeXhdlOqrjmMkGvLDDxrTbNJIb-L-x4uGpbkjRknTiDZq753X7i2OX77r-8EhzfnnrsOdYx8jL89D3HROzd30c3](http://wenku.baidu.com/link?url=VaDOEc8KpmsbJ5R6gvJfWeXhdlOqrjmMkGvLDDxrTbNJIb-L-x4uGpbkjRknTiDZq753X7i2OX77r-8EhzfnnrsOdYx8jL89D3HROzd30c3)

Modbus: [https://en.wikipedia.org/wiki/Modbus#Frame_format](https://en.wikipedia.org/wiki/Modbus#Frame_format)
