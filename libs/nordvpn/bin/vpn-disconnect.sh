#!/bin/sh

# Tell systemctl to disconnect any
systemctl openvpn@\*
echo "Disconnected VPN"

# Flush iptables
iptables -F
iptables -t nat -F
echo "Flushed iptables"