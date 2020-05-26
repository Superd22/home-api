#!/bin/sh
## helper script to connect to a specified vpn server.

. vpn-disconnect.sh

# Tell systemctl to connect
systemctl openvpn@$1
echo "Connected to vpn through tun0"

iptables -t nat -A POSTROUTING -s 192.168.0.0/16 \! -d 192.168.0.0/16 -o tun0 -j MASQUERADE
echo "Routing through tun0"