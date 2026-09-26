"use client";

import React from "react";
import { AddStudentModal } from "./AddStudentModal";

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (data?: any) => void;
}

export function AddUserModal({ isOpen, onClose, onSave }: AddUserModalProps) {
  return <AddStudentModal isOpen={isOpen} onClose={onClose} onSave={onSave} />;
}
