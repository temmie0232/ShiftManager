1. モデル (accounts/models.py):
```python
- Employee: 従業員の情報を管理
  - name: 名前 (CharField)
  - can_open: オープン作業が可能 (BooleanField)
  - can_close_cleaning: クローズ洗浄作業が可能 (BooleanField)
  - can_close_cashier: クローズキャッシャー作業が可能 (BooleanField)
  - can_close_floor: クローズフロア清掃作業が可能 (BooleanField)
  - can_order: 解凍発注作業が可能 (BooleanField)
  - is_beginner: 新人かどうか (BooleanField)
  - created_at: 作成日時 (DateTimeField)
  - updated_at: 更新日時 (DateTimeField)
```

2. URLルーティング (accounts/urls.py):
```python
- /api/accounts/employees/: 従業員一覧の取得(GET)・新規作成(POST)
- /api/accounts/employees/<id>/: 
  - 特定従業員の取得(GET)
  - 更新(PUT/PATCH)
  - 削除(DELETE)
```

3. ビュー (accounts/views.py):
```python
- EmployeeListCreate: 従業員一覧の取得と新規作成
  - list(): 全従業員の一覧を取得
  - create(): 新規従業員を作成

- EmployeeRetrieveUpdateDestroy: 個別の従業員の操作
  - retrieve(): 特定の従業員の詳細情報を取得
  - update(): 従業員情報を更新
  - destroy(): 従業員を削除
```

4. シリアライザー (accounts/serializers.py):
```python
- EmployeeSerializer: 従業員モデルのシリアライズ
  - id: ID (読み取り専用)
  - name: 名前
  - can_open: オープン作業可能
  - can_close_cleaning: クローズ洗浄作業可能
  - can_close_cashier: クローズキャッシャー作業可能
  - can_close_floor: クローズフロア清掃作業可能
  - can_order: 解凍発注作業可能
  - is_beginner: 新人かどうか
  - created_at: 作成日時 (読み取り専用)
  - updated_at: 更新日時 (読み取り専用)
```
