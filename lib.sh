#!/bin/bash

log_info(){
	local msg="$1"
	echo "[$(date  +%H :%M :%S) ] [INFO] $msg";
}
log_info "Demarrage"
log_info"Fin"

log_warn() { echo "ATTENTION !"; }
log_error() {
