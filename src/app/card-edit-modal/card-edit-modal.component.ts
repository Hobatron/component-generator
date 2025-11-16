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
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormControl,
} from '@angular/forms';
import { CategorySchema, DynamicItem } from '../models/category-schema.model';

@Component({
  selector: 'app-card-edit-modal',
  templateUrl: './card-edit-modal.component.html',
  styleUrls: ['./card-edit-modal.component.scss'],
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardEditModalComponent {
  private readonly fb = inject(FormBuilder);

  // Inputs
  readonly isOpen = input<boolean>(false);
  readonly item = input<DynamicItem | null>(null);
  readonly schema = input.required<CategorySchema>();

  // Outputs
  readonly close = output<void>();
  readonly save = output<DynamicItem>();

  // Signals
  readonly form = signal<FormGroup>(this.fb.group({}));

  constructor() {
    // Rebuild form when schema changes
    effect(() => {
      const currentSchema = this.schema();
      if (currentSchema) {
        this.form.set(this.createFormFromSchema(currentSchema));
      }
    });

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

  private createFormFromSchema(schema: CategorySchema): FormGroup {
    const group: Record<string, FormControl> = {};

    schema.fields.forEach((field) => {
      const validators = field.required ? [Validators.required] : [];
      group[field.name] = new FormControl('', validators);
    });

    return this.fb.group(group);
  }

  protected onClose(): void {
    this.close.emit();
  }

  protected onSave(): void {
    if (this.form().valid) {
      const formValue = this.form().value;
      const currentSchema = this.schema();

      // Only include fields defined in schema
      const savedItem: DynamicItem = {};
      currentSchema.fields.forEach((field) => {
        if (formValue[field.name] !== undefined && formValue[field.name] !== '') {
          savedItem[field.name] = formValue[field.name];
        }
      });

      this.save.emit(savedItem);
      this.onClose();
    }
  }
}
