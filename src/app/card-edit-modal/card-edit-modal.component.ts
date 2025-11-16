import {
  Component,
  input,
  output,
  effect,
  signal,
  computed,
  ChangeDetectionStrategy,
  inject,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Action } from '../models/action.model';
import { Equipment } from '../models/equipment.model';
import { Usable } from '../models/usable.model';
import { TitleCasePipe } from '@angular/common';

type CardItem = Action | Equipment | Usable;

@Component({
  selector: 'app-card-edit-modal',
  templateUrl: './card-edit-modal.component.html',
  styleUrls: ['./card-edit-modal.component.scss'],
  imports: [ReactiveFormsModule, TitleCasePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardEditModalComponent {
  private readonly fb = inject(FormBuilder);

  // Inputs
  readonly isOpen = input<boolean>(false);
  readonly item = input<CardItem | null>(null);
  readonly itemType = input<'actions' | 'equipments' | 'usables'>('actions');

  // Outputs
  readonly close = output<void>();
  readonly save = output<CardItem>();

  // Signals
  readonly form = signal<FormGroup>(this.createForm());

  readonly formFields = computed(() => {
    const type = this.itemType();
    switch (type) {
      case 'actions':
        return ['id', 'type', 'rules'];
      case 'equipments':
        return ['id', 'name', 'type', 'rules', 'cost'];
      case 'usables':
        return ['id', 'name', 'type', 'rules', 'slot'];
      default:
        return ['id', 'type', 'rules'];
    }
  });

  constructor() {
    // Update form when item changes
    effect(() => {
      const currentItem = this.item();
      if (currentItem) {
        this.form().patchValue(currentItem);
      }
    });

    // Reset form when modal closes
    effect(() => {
      if (!this.isOpen()) {
        this.form().reset();
      }
    });
  }

  private createForm(): FormGroup {
    return this.fb.group({
      id: [null, Validators.required],
      name: [''],
      type: ['', Validators.required],
      rules: ['', Validators.required],
      cost: [''],
      slot: [''],
    });
  }

  protected onClose(): void {
    this.close.emit();
  }

  protected onSave(): void {
    if (this.form().valid) {
      const formValue = this.form().value;
      const fields = this.formFields();

      // Only include relevant fields for the item type
      const savedItem: any = {};
      fields.forEach((field) => {
        if (formValue[field] !== undefined && formValue[field] !== '') {
          savedItem[field] = formValue[field];
        }
      });

      this.save.emit(savedItem as CardItem);
      this.onClose();
    }
  }

  protected hasField(fieldName: string): boolean {
    return this.formFields().includes(fieldName);
  }

  protected getFieldLabel(fieldName: string): string {
    const labels: Record<string, string> = {
      id: 'ID',
      name: 'Name',
      type: 'Type',
      rules: 'Rules',
      cost: 'Cost',
      slot: 'Slot',
    };
    return labels[fieldName] || fieldName;
  }
}
